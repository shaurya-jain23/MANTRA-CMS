import React, { useState, useEffect, useMemo } from 'react';
import { selectUser } from '../features/user/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllDealers ,selectDealersStatus, fetchDealers, setDealersStatus } from '../features/dealers/dealersSlice';
import dealerService from '../firebase/dealers';
import { Button, DealerCard, DealerForm, Container, StatCard, Tabs, SearchBar, Loading } from '../components';
import {toast} from 'react-hot-toast';
import { PlusCircle,Store, BadgeCheck, BadgeX, AlertCircle, FileText  } from 'lucide-react';

function DealersPage() {
  const dispatch = useDispatch();
  const dealersStatus = useSelector(selectDealersStatus);
  const dealersData = useSelector(selectAllDealers);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dealerToEdit, setDealerToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);

  // Fetch dealers based on user role
  useEffect(() => {
      if (dealersStatus === 'idle') {
        dispatch(fetchDealers({ role: userData.role, userId: userData.uid }));
      }
      if(dealersStatus === 'succeeded'){
        setDealers(dealersData);
        setLoading(false);
      }
      if(dealersStatus === 'failed'){
        setError('Failed to fetch dealers.')
        toast.error('Failed to load dealers.')
        setLoading(false)
      }
    }, [dealersStatus, dispatch, userData]);



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
    }, [dealers, searchQuery ,activeTab]);

  const loadStates = async (countryCode) => {
      const { State } = await import("country-state-city");
      return State.getStatesOfCountry(countryCode);
    };
  const [allIndianStates, setAllIndianStates] = useState([])
  useEffect(() => {
    loadStates("IN").then(setAllIndianStates);
  }, [isFormOpen]);
  const handleOpenForm = (dealer = null) => {
    if(dealer){
        dealer.state = allIndianStates.find(s => {
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
    const toastId = toast.loading('Submitting the Form...');
    data.state = allIndianStates.find(s => s.isoCode === data.state).name.toUpperCase();
    data.district= data.district.toUpperCase();
    data.trade_name= data.trade_name.toUpperCase();
    if (dealerToEdit) { 
      await dealerService.updateDealer(dealerToEdit.id, data);
      setDealers(dealers.map(d => d.id === dealerToEdit.id ? { ...d, ...data } : d));
    } else { 
      const newDealer = await dealerService.addDealer(data, userData);
      setDealers([newDealer, ...dealers]);
    }
    toast.dismiss(toastId);
    dispatch(setDealersStatus("idle"))
    handleCloseForm();
  };
  
  const handleStatusChange = async (dealerId, status) => {
      const toastId = toast.loading('Chnaging dealer status...');
      await dealerService.updateDealer(dealerId, { status });
      setDealers(dealers.map(d => d.id === dealerId ? { ...d, status } : d));
      toast.dismiss(toastId);
      dispatch(setDealersStatus("idle"))
  };

  const activeDealers = dealers.filter(d => d.status !== 'disabled').length;
  const inactiveDealers = dealers.filter(d => d.status === 'disabled').length;
  if (loading) {
    return <Loading isOpen={true} message="Loading Dealers Data..." />
  }
  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
      <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Dealer Management</h1>
        <div className="mt-6 flex justify-end">
            <Button
                onClick={() => handleOpenForm()}
                variant='primary'
                className="!rounded-4xl !w-fit"
                >
                <PlusCircle size={20} className="mr-2"/> Register Dealer
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Dealers" value={dealers.length} icon={<Store className="text-blue-500" />} />
              <StatCard title="Active Dealers" value={activeDealers} icon={<BadgeCheck className="text-green-500" />} />
              <StatCard title="Inactive Dealers" value={inactiveDealers} icon={<BadgeX className="text-red-500" />} />
        </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && <Tabs tabs={SalesTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by Firm name, Gst no, District, State...'}
            query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={processedDealers.length}/>
            </div>
      </div>
      {error && 
        <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className='w-8 h-8 text-red-600'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>Error Occured</h3>
        <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
      </div>      
      }

      {!error && (processedDealers.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No dealers found</h3>
        <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any of the dealers. <br /> Try adjusting search.</p>
        {dealers.length === 0 && (
          <Button
                onClick={() => handleOpenForm()}
                variant='primary'
                className="!rounded-4xl transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/>Register First Dealer
            </Button>
        )}
      </div> : <>
       <div className="hidden lg:grid grid-cols-9 items-center gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg">
          <div>DEALER FIRM TRADENAME</div>
          <div className="col-span-2">CONTACT PERSON | PHONE NO.</div>
          {/* <div className="col-span-1">PHONE NO.</div> */}
          <div>GST NO.</div>
          <div className="col-span-2">DISTRICT | STATE | PINCODE</div>
         
          <div>{isAdmin ? 'SALES PERSON' : 'ADDRESS'}</div>
          <div className="col-span-2">ACTIONS</div>
        </div>
      
      <div className="space-y-4">
            {processedDealers.map(dealer => (
            <DealerCard 
                key={dealer.id} 
                dealer={dealer}
                onEdit={handleOpenForm}
                onStatusChange={handleStatusChange}
                userData={userData}
            />
            ))}
        </div>
      </>)}
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

