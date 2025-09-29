import { useState, useEffect, useMemo } from 'react';
import { selectUser } from '../../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPIs , fetchPis, selectPIStatus, setPIStatus } from '../../features/performa-invoices/PISlice';
import { Button, PICard, Container, StatCard, Tabs, SearchBar, Loading, ConfirmationAlert } from '../../components';
import { PlusCircle, FileText, IndianRupee, ShieldAlert, AlertTriangle, AlertCircle } from 'lucide-react';
import {toast} from 'react-hot-toast';
import piService from '../../firebase/piService';

function PerformaInvoicesPage() {
   const dispatch = useDispatch();
   const navigate  = useNavigate();
  const PIStatus = useSelector(selectPIStatus);
  const PIData = useSelector(selectAllPIs);
  const [PIs, setPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);


  const [alertState, setAlertState] = useState({
      isOpen: false,
      action: null, 
      pi_id: null,
      pi_number: null
    });
    

  // Fetch PIs based on user role
  useEffect(() => {
      if (PIStatus === 'idle') {
        dispatch(fetchPis({ role: userData.role, userId: userData.uid }));
      }
      if(PIStatus === 'succeeded'){
        setPIs(PIData || []);
        setLoading(false);
        setError('')
      }
      if(PIStatus === 'failed'){
        setError('Failed to fetch PIs.')
        toast.error(`Failed to fetch Invoices`)
        setLoading(false)
      }
    }, [PIStatus, dispatch, userData]);

    const getModalConfig = () => {
    switch (alertState.action) {
      case 'delete':
        return { title: 'Delete Booking', message: 'Are you sure you want to permanently delete this performa invoice? This action cannot be undone.', confirmText: 'Yes, Delete', confirmColor: 'bg-red-600', icon: <AlertTriangle className="h-12 w-12 text-red-500"/> };
      default:
        return {};
      }
    };

    const openConfirmationModal = (pi_id, pi_number) => {
    setAlertState({ isOpen: true, action: 'delete', pi_id, pi_number });
  };

    const closeConfirmationModal = () => {
      setAlertState({ isOpen: false, action: null, pi_id: null, pi_number: null });
    };

    const handleDelete = async () => {
      const { pi_id, pi_number } = alertState;
      if (!pi_id || !pi_id) return;
      const toastId = toast.loading('Deleting the PI...');
      closeConfirmationModal();
      try {
        await piService.deletePI(pi_id, pi_number)
        setPIs(PIs.filter(pi => pi.id !== pi_id ))
      } catch (error) {
        toast.error('"An error occurred: " + error.message')
      } finally {
            toast.dismiss(toastId);
            dispatch(setPIStatus("idle"));
          }
    }
    const handleStatusChange = async (piId, status) => {
      await piService.updatePI(piId, { status });
      setPIs(PIs.map(pi => pi.id === piId ? { ...pi, status } : pi));
      dispatch(setPIStatus("idle"))
    };
    const TabsOptions =  [...new Set(PIs?.map(c => c.generated_by_name?.trim().toUpperCase()).filter(Boolean))].map(u => { return {name: u}})
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
          String(pi.pi_number).toLowerCase().includes(lowercasedQuery) ||
          String(pi.billing.firm).toLowerCase().includes(lowercasedQuery) ||
          String(pi.pi_date).toLowerCase().includes(lowercasedQuery) ||
          String(pi.generated_by_name).toLowerCase().includes(lowercasedQuery) ||
          String(pi.status).toLowerCase().includes(lowercasedQuery)
        );
      }
      return processed;
    }, [PIs, searchQuery ,activeTab]);

  const paidInvoices = processedInvoices.filter(pi => pi.status !== 'unpaid').length;
  const unpaidInvoices = processedInvoices.filter(pi => pi.status === 'unpaid').length;
  if (loading) {
    return <Loading isOpen={true} message="Loading PI Page..." />
  }
  
  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
      <div className="w-full flex flex-col justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Proforma Invoices (PI)</h1>
        <div className="mt-6 flex justify-end">
            <Button
              variant='primary'
                onClick={() => navigate('/performa-invoices/new')}
                className=" hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/> Generate New PI
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Invoices" value={processedInvoices.length} icon={<FileText className="text-blue-500" />} />
              <StatCard title="Total Paid" value={paidInvoices} icon={<IndianRupee className="text-green-500" />} />
              <StatCard title="Total Unpaid" value={unpaidInvoices} icon={<IndianRupee className="text-red-500" />} />
      </div> 
      <div className="bg-white p-4 border-b-gray-100">
            {isAdmin && PIs.length > 0 && <Tabs tabs={SalesTabs} activeTab={activeTab} onTabClick={setActiveTab} />}
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-4">
            <SearchBar
            placeholder= {'Search by PI Number, Dealer firmname, PI Date, PI Status...'}
            query={searchQuery} setQuery={setSearchQuery} className='' resultCount={processedInvoices?.length}/>
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
      {!error && (processedInvoices.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No invoices found</h3>
        <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any invoices. <br /> Try adjusting search.</p>
        {PIs.length === 0 && (
          <Button onClick={() => navigate('/performa-invoices/new')} className=" hover:bg-blue-700 !rounded-4xl transition md:w-auto flex items-center">
            <PlusCircle size={20} className="mr-2"/>Create First Invoice</Button>
        )}
      </div> :
      <>
        <div className={`hidden lg:grid ${isAdmin ? 'grid-cols-9' : 'grid-cols-8'}  gap-4 px-4 py-2 font-normal text-md text-gray-600 text-center bg-gray-50 rounded-lg`}>
          <div>INVOICE #</div>
          <div className="col-span-2">CLEINT</div>
          <div>AMOUNT</div>
          <div>INVOICE DATE</div>
          {isAdmin && <div>SALES PERSON</div>}
          <div>STATUS</div>
          <div className="col-span-2">ACTIONS</div>
        </div>
        <div className="">
              {processedInvoices.map(invoice => (
              <PICard 
                  key={invoice.id}
                  invoice={invoice}
                  onDelete={openConfirmationModal}
                  onStatusChange={handleStatusChange}
                  userData={userData}
              />
              ))}
          </div>
      </>)}
        <ConfirmationAlert
          isOpen={alertState.isOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleDelete}
          {...getModalConfig()}
        />
      </div>
    </Container>
  );
}

export default PerformaInvoicesPage