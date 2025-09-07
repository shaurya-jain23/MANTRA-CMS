import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import dealerService from '../firebase/dealers';
import { Button, DealerCard, DealerForm, Container, StatCard, Tabs, SearchBar } from '../components';
import { PlusCircle,Ship, Anchor, ListChecks  } from 'lucide-react';
import { TABS } from '../assets/utils';
import { State } from 'country-state-city';

function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dealerToEdit, setDealerToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);

  // Fetch dealers based on user role
  useEffect(() => {
    if (userData?.uid) {
      setLoading(true);
      const fetchDealers = isAdmin
        ? dealerService.getAllDealers()
        : dealerService.getDealersBySalesperson(userData.uid);
      
      fetchDealers
        .then(setDealers)
        .catch(() => setError('Failed to fetch dealers.'))
        .finally(() => setLoading(false));
    }
  }, [userData]);


  const TabsOptions =  [...new Set(dealers.map(c => c.registered_by_name?.trim().toUpperCase()).filter(Boolean))].map(u => { return {name: u}})
  const SalesTabs = [{name: 'ALL'}, ...TabsOptions]
  
  const processedDealers = useMemo(() => {
      let processed = [...dealers]
      TabsOptions.forEach(user => {
        if(activeTab === user.name) {
          processed = processed.filter(d => d.registered_by_name.toUpperCase() === user.name);
        }
      })
      if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        processed = processed.filter(d => 
          String(d.trade_name).toLowerCase().includes(lowercasedQuery) ||
          String(d.gst_no).toLowerCase().includes(lowercasedQuery) ||
          String(d.gst_no).toLowerCase().includes(lowercasedQuery) ||
          String(d.district).toLowerCase().includes(lowercasedQuery) ||
          String(d.state).toLowerCase().includes(lowercasedQuery)
        );
      }
      return processed;
    }, [dealers, searchQuery, ,activeTab]);

  // Handlers for form and actions
  const handleOpenForm = (dealer = null) => {
    if(dealer){
        dealer.state = State.getStatesOfCountry('IN').find(s => {
          if(s.name.toUpperCase() == dealer.state.toUpperCase()) return s.name})?.isoCode;
        setDealerToEdit(dealer);
    }
    else{
      setDealerToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setDealerToEdit(null);
  };

  const handleFormSubmit = async (data) => {
    console.log(data);
    
    data.state = State.getStateByCodeAndCountry(data.state, 'IN').name.toUpperCase();
    data.district= data.district.toUpperCase();
    data.trade_name= data.trade_name.toUpperCase();
    console.log(data);
    
    if (dealerToEdit) { 
      await dealerService.updateDealer(dealerToEdit.id, data);
      setDealers(dealers.map(d => d.id === dealerToEdit.id ? { ...d, ...data } : d));
    } else { // Add new dealer
      const newDealer = await dealerService.addDealer(data, userData);
      console.log(newDealer);
      
      setDealers([newDealer, ...dealers]);
    }
    handleCloseForm();
  };
  
  const handleStatusChange = async (dealerId, status) => {
      await dealerService.updateDealer(dealerId, { status });
      setDealers(dealers.map(d => d.id === dealerId ? { ...d, status } : d));
  };

  const atSeaCount = dealers.filter(d => d.status !== 'disabled').length;
  const atPortCount = dealers.filter(d => d.status === 'disabled').length;

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
      <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Dealer Management</h1>
        <div className="mt-6 flex justify-end">
            <Button
                onClick={() => handleOpenForm()}
                className="bg-blue-600 hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/> Register Dealer
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Dealers" value={dealers.length} icon={<ListChecks className="text-blue-500" />} />
              <StatCard title="Active Dealers" value={atSeaCount} icon={<Ship className="text-teal-500" />} />
              <StatCard title="Disabled Dealers" value={atPortCount} icon={<Anchor className="text-indigo-500" />} />
        </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && <Tabs tabs={SalesTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by Firm name, Gst no, District, State...'}
            query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={processedDealers.length}/>
            </div>
        </div>
        <div className="hidden lg:grid grid-cols-9 gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg">
          <div>DEALER FIRM TRADENAME</div>
          <div className="col-span-2">CONTACT PERSON | PHONE NO.</div>
          {/* <div className="col-span-1">PHONE NO.</div> */}
          <div>GST NO.</div>
          <div className="col-span-2">DISTRICT | STATE | PINCODE</div>
          <div>SALES PERSON</div>
          <div className="col-span-2">ACTIONS</div>
      </div>
      {loading && <p>Loading dealers...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && dealers.length === 0 && (
        <p className="text-gray-600">No dealers found. Click "Register Dealer" to add a new dealer.</p>
      )}
      
      {!loading && <div className="space-y-4">
            {processedDealers.map(dealer => (
            <DealerCard 
                key={dealer.id} 
                dealer={dealer}
                onEdit={handleOpenForm}
                onStatusChange={handleStatusChange}
                userData={userData}
            />
            ))}
        </div>}

      <DealerForm
        key={dealerToEdit ? dealerToEdit.id : "new"}
        dealerToEdit={dealerToEdit}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
        isOpen={isFormOpen}
      />
      </div>
    </Container>
  );
}

export default DealersPage;

