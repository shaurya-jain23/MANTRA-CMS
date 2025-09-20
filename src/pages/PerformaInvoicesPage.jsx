import React, { useState, useEffect, useMemo } from 'react';
import { selectUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPIs , fetchPis, selectPIStatus, setPIStatus } from '../features/performa-invoices/PISlice';
import { Button, PICard, Container, StatCard, Tabs, SearchBar, Loading } from '../components';
import { PlusCircle, FileText, IndianRupee } from 'lucide-react';

function PerformaInvoicesPage() {
   const dispatch = useDispatch();
   const navigate  = useNavigate();
  const PIStatus = useSelector(selectPIStatus);
  const PIData = useSelector(selectAllPIs);
  const [PIs, setPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [PItoEdit, setPItoEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);

  // Fetch PIs based on user role
  useEffect(() => {
      if (PIStatus === 'idle') {
        dispatch(fetchPis({ role: userData.role, userId: userData.uid }));
      }
      if(PIStatus === 'succeeded'){
        setPIs(PIData);
        setLoading(false);
      }
      if(PIStatus === 'failed'){
        setError('Failed to fetch dealers.')
        setLoading(false)
      }
    }, [PIStatus, dispatch, userData]);

    const handleEditForm = () =>{
        console.log("edit form");
        
    }
    const handleStatusChange = () =>{
        console.log("status form");
        
    }
  const TabsOptions =  [...new Set(PIs.map(c => c.generated_by_name?.trim().toUpperCase()).filter(Boolean))].map(u => { return {name: u}})
  const SalesTabs = [{name: 'ALL'}, ...TabsOptions]
  
  const processedInvoices = useMemo(() => {
      let processed = [...PIs]
      TabsOptions.forEach(user => {
        if(activeTab === user.name) {
          processed = processed.filter(pi => pi.generated_by_name.toUpperCase() === user.name);
        }
      })
      if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        processed = processed.filter(pi => 
          String(pi.trade_name).toLowerCase().includes(lowercasedQuery) ||
          String(pi.gst_no).toLowerCase().includes(lowercasedQuery) ||
          String(pi.gst_no).toLowerCase().includes(lowercasedQuery) ||
          String(pi.district).toLowerCase().includes(lowercasedQuery) ||
          String(pi.state).toLowerCase().includes(lowercasedQuery)
        );
      }
      return processed;
    }, [PIs, searchQuery ,activeTab]);

  const paidInvoices = PIs.filter(pi => pi.status !== 'unpaid').length;
  const unpaidInvoices = PIs.filter(pi => pi.status === 'unpaid').length;
    if (loading) {
    return <Loading isOpen={true} message="Loading Page..." />
  }
  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
      <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Proforma Invoices (PI)</h1>
        <div className="mt-6 flex justify-end">
            <Button
                onClick={() => navigate('/generate-pi')}
                className=" hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/> Generate New PI
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Invoices" value={PIs.length} icon={<FileText className="text-blue-500" />} />
              <StatCard title="Total Paid" value={paidInvoices} icon={<IndianRupee className="text-green-500" />} />
              <StatCard title="Total Unpaid" value={unpaidInvoices} icon={<IndianRupee className="text-red-500" />} />
        </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && <Tabs tabs={SalesTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by Firm name, Gst no, District, State...'}
            query={searchQuery} setQuery={setSearchQuery} className='rounded-xs py-2' resultCount={processedInvoices.length}/>
            </div>
        </div>
        <div className={`hidden lg:grid ${isAdmin ? 'grid-cols-9' : 'grid-cols-8'}  gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg`}>
          <div>INVOICE #</div>
          <div className="col-span-2">CLEINT</div>
          <div>AMOUNT</div>
          <div>INVOICE DATE</div>
          {isAdmin && <div>SALES PERSON</div>}
          <div>STATUS</div>
          <div className="col-span-2">ACTIONS</div>
        </div>
      {loading && <p>Loading dealers...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && PIs.length === 0 && (
        <p className="text-gray-600">No PIs found. Click "Generate New PI" to create a new Performa Invoice.</p>
      )}
      
      {!loading && <div className="space-y-4">
            {processedInvoices.map(invoice => (
            <PICard 
                invoice={invoice}
                onEdit={handleEditForm}
                onStatusChange={handleStatusChange}
                userData={userData}
            />
            ))}
        </div>}
      </div>
    </Container>
  );
}

export default PerformaInvoicesPage