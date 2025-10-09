import { useState, useEffect, useMemo, useCallback } from 'react';
import { selectUser } from '../../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPIs , fetchPis, selectPIStatus, setPIStatus } from '../../features/performa-invoices/PISlice';
import { Button, PICard, Container, StatCard, Tabs, SearchBar, Loading } from '../../components';
import { PlusCircle, FileText, IndianRupee, AlertTriangle, AlertCircle, Container as Container1 } from 'lucide-react';
import {toast} from 'react-hot-toast';
// import { useModal } from '../../contexts/ModalContext';
import piService from '../../firebase/piService';
import { usePIActions } from '../../hooks/usePIActions';
import { PI_STATUS, PI_TYPES } from '../../assets/utils';

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
  const [activePIType, setActivePIType] = useState(PI_TYPES.NORMAL);
  const userData = useSelector(selectUser);
  const isAdmin = ['admin', 'superuser'].includes(userData?.role);
    
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

    const handleStatusChange = async (piId, status) => {
      await piService.updatePI(piId, { status });
      setPIs(PIs.map(pi => pi.id === piId ? { ...pi, status } : pi));
      dispatch(setPIStatus("idle"))
    };

    // Handler for successful PI actions
  const handleActionSuccess = useCallback((result) => {
    if (!result.success) {
      toast.error(`Action failed: ${result.error}`);
      return;
    }
    const { action, performa_invoice, newStatus } = result;
    
    switch (action) {
      case 'delete':
        // Remove PI from state
        setPIs(prevPIs => prevPIs.filter(pi => pi.id !== performa_invoice.id));
        toast.success(`PI #${performa_invoice.pi_number} deleted successfully`);
        break;
        
      case 'submit':
        // Update PI status to submitted
        setPIs(prevPIs => prevPIs.map(pi => 
          pi.id === performa_invoice.id ? { ...pi, status: newStatus } : pi
        ));
        toast.success(`PI #${performa_invoice.pi_number} submitted for approval`);
        break;
        
      case 'approve':
        // Update PI status to approved
        setPIs(prevPIs => prevPIs.map(pi => 
          pi.id === performa_invoice.id ? { ...pi, status: newStatus } : pi
        ));
        toast.success(`PI #${performa_invoice.pi_number} approved successfully`);
        break;
        
      case 'reject':
        // Update PI status to rejected
        setPIs(prevPIs => prevPIs.map(pi => 
          pi.id === performa_invoice.id ? { ...pi, status: newStatus } : pi
        ));
        toast.success(`PI #${performa_invoice.pi_number} rejected`);
        break;
        
      default:
        break;
    }
  }, []);

  const {
    processingAction,
    handleConfirmAction,
    alertState,
    setAlertState
  } = usePIActions(handleActionSuccess);

    
    const TabsOptions =  [...new Set(PIs?.map(c => c.generated_by_name?.trim().toUpperCase()).filter(Boolean))].map(u => { return {name: u}})
    const SalesTabs = [{name: 'ALL'}, ...TabsOptions]
  
  const processedInvoices = useMemo(() => {
      let processed = [...PIs]
      // Filter by PI type
      processed = processed.filter(pi => pi.type === activePIType);

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
    }, [PIs, searchQuery ,activeTab, activePIType]);

  const paidInvoices = processedInvoices.filter(pi => pi.status !== 'unpaid').length;
  const unpaidInvoices = processedInvoices.filter(pi => pi.status === 'unpaid').length;
  const draftInvoices = processedInvoices.filter(pi => pi.status === PI_STATUS.DRAFT).length;
  const submittedInvoices = processedInvoices.filter(pi => pi.status === PI_STATUS.SUBMITTED).length;
  if (loading) {
    return <Loading isOpen={true} message="Loading PI Page..." />
  }
  
  return (
    <Container>
      <div className="w-full bg-white rounded-2xl shadow-md">
        <div className="mb-3">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActivePIType(PI_TYPES.NORMAL)}
                className={`p-4  border-b-0 font-medium text-sm flex items-center gap-2 ${
                  activePIType === PI_TYPES.NORMAL
                    ? 'border-b-blue-500 text-blue-600 border-1 border-gray-200 rounded-t-2xl'
                    : 'border-b-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-motorbike-icon lucide-motorbike"><path d="m18 14-1-3"/><path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81"/><path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5"/><circle cx="19" cy="17" r="3"/><circle cx="5" cy="17" r="3"/></svg>
                Normal Orders
                <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                  {PIs.filter(pi => pi.type === PI_TYPES.NORMAL).length}
                </span>
              </button>
              <button
                onClick={() => setActivePIType(PI_TYPES.CONTAINER)}
                className={`p-4 border-b-0 font-medium text-sm flex items-center gap-2  ${
                  activePIType === PI_TYPES.CONTAINER
                    ? 'border-b-blue-500 text-blue-600 border-1 border-gray-200 rounded-t-2xl'
                    : 'border-b-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Container1 size={18} />
                Container PIs
                <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                  {PIs.filter(pi => pi.type === PI_TYPES.CONTAINER).length}
                </span>
              </button>
            </nav>
          </div>
        </div>
        <div className="w-full p-4 sm:p-6 lg:p-8 ">
        {/* PI Type TABs */}
        <div className="w-full flex flex-col justify-between  mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Proforma Invoices (PI)</h1>
          <div className="mt-6 flex justify-end">
              <Button
                variant='primary'
                  onClick={() => navigate('/performa-invoices/new')}
                  className=" !rounded-4xl !w-fit"
                  >
                  <PlusCircle size={20} className="mr-2"/> Generate New PI
              </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Invoices" value={processedInvoices.length} icon={<FileText className="text-blue-500" />} />
          <StatCard title="Draft" value={draftInvoices} icon={<FileText className="text-yellow-500" />} />
          <StatCard title="Submitted" value={submittedInvoices} icon={<FileText className="text-blue-500" />} />
          <StatCard title="Final" value={processedInvoices.filter(pi => pi.status === PI_STATUS.FINAL).length} icon={<FileText className="text-green-500" />} />
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
          <h3 className='text-lg font-medium text-slate-900 mb-2'>No {activePIType === PI_TYPES.CONTAINER ? 'container' : 'normal'} invoices found</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            {searchQuery ? 'Your search criteria did not match any invoices.' : `No ${activePIType} invoices created yet.`}
          </p>
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
          <div className="space-y-4 lg:space-y-0">
                {processedInvoices.map(invoice => (
                <PICard 
                    key={invoice.id}
                    invoice={invoice}
                    onAction={(action, invoice) => setAlertState({ isOpen: true, action, performa_invoice:invoice })}
                    onStatusChange={handleStatusChange}
                    userData={userData}
                />
                ))}
            </div>
        </>)}
        </div>
      </div>
    </Container>
  );
}

export default PerformaInvoicesPage