import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useModal } from '../contexts/ModalContext';
import piService from '../firebase/piService';
import { setPIStatus } from '../features/performa-invoices/PISlice';
import { FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PI_STATUS } from '../assets/utils';

export const usePIActions = (onActionComplete = null) => {
  const dispatch = useDispatch();
  const { showModal } = useModal();
  const [processingAction, setProcessingAction] = useState(false);
  const [alertState, setAlertState] = useState({
      isOpen: false,
      action: null, 
      performa_invoice: null
    });

  const getModalConfig = () => {
    switch (alertState.action) {
      case 'submit':
        return { 
          title: 'Submit for Approval', 
          message: 'Are you sure you want to submit this PI for approval? You cannot edit it once submitted.', 
          confirmText: 'Yes, Submit', 
          confirmColor: 'bg-blue-600', 
          icon: <FileText className="h-12 w-12 text-blue-500"/> 
        };
      case 'delete':
        return { 
          title: 'Delete Proforma Invoice', 
          message: 'Are you sure you want to permanently delete this performa invoice? This action cannot be undone.', 
          confirmText: 'Yes, Delete', 
          confirmColor: 'bg-red-600', 
          icon: <AlertTriangle className="h-12 w-12 text-red-500"/> 
        };
      case 'approve':
        return { 
          title: 'Approve PI', 
          message: 'Are you sure you want to approve this performa invoice?', 
          confirmText: 'Yes, Approve', 
          confirmColor: 'bg-green-600', 
          icon: <CheckCircle className="h-12 w-12 text-green-500"/> 
        };
      case 'reject':
        return { 
          title: 'Reject PI', 
          message: 'Are you sure you want to reject this performa invoice? Please provide a reason.', 
          confirmText: 'Yes, Reject', 
          confirmColor: 'bg-red-600', 
          icon: <XCircle className="h-12 w-12 text-red-500"/>,
          showReasonInput: true 
        };
      default:
        return {};
    }
  };

  useEffect(() => {
        if (alertState.isOpen && alertState.action) {
          const modalConfig = getModalConfig();
          if (modalConfig) {
            showModal({
              ...modalConfig,
              onConfirm: handleConfirmAction,
            });
          }
        }
      }, [alertState]);


  const executeAction = useCallback(async (action, performa_invoice, reason = '') => {
    setProcessingAction(true);
    const actionText = action === 'submit' ? 'Submitting' : 
                      action === 'delete' ? 'Deleting' : 
                      action === 'approve' ? 'Approving' : 
                      action === 'reject' ? 'Rejecting' : 'Processing';
    
    const toastId = toast.loading(`${actionText} PI...`);
    
    try {
      let result;
      let newStatus;
      switch (action) {
        case 'submit':
          result = await piService.submitPIForApproval(performa_invoice.id, performa_invoice.pi_number);
          newStatus = PI_STATUS.SUBMITTED;
          break;
        case 'delete':
          result = await piService.deletePI(performa_invoice.id, performa_invoice.pi_number);
          newStatus = 'deleted'
          break;
        case 'approve':
           // Get current user role (you'll need to pass this or get from context)
          const approverRole = 'sales_manager'; // TODO: Get from user context
          result = await piService.approvePI(performa_invoice.id, performa_invoice.pi_number, approverRole, reason);
          newStatus = result; 
          break;
        case 'reject':
          const rejecterRole = 'sales_manager'; // TODO: Get from user context
          result = await piService.rejectPI(performa_invoice.id, performa_invoice.pi_number, rejecterRole, reason);
          newStatus = PI_STATUS.REJECTED; 
          break;
        default:
          break;
      }
      
      const successResult = {
        success: true,
        action,
        performa_invoice,
        result,
        newStatus: newStatus,
        reason
      };
      
      // Call the callback with success result
      if (onActionComplete) {
        onActionComplete(successResult);
      }
      
      return successResult;
    } catch (error) {
      const errorResult = { 
        success: false, 
        error: error.message,
        action,
        performa_invoice
      };
      
      // Call the callback with error result
      if (onActionComplete) {
        onActionComplete(errorResult);
      }
      toast.error('An error occurred: ' + error.message);
      return errorResult;
    } finally {
      toast.dismiss(toastId);
      setProcessingAction(false);
      dispatch(setPIStatus("idle"));
    }
  }, [onActionComplete, dispatch]);

   const handleConfirmAction = useCallback(async (reason = '') => {
    const { action, performa_invoice } = alertState;
    if (!action || !performa_invoice) return;
    const result = await executeAction(action, performa_invoice, reason);
    setAlertState({ isOpen: false, action: null, performa_invoice: null });
    return result;
  }, [alertState, executeAction ])

  

  return {
    processingAction,
    handleConfirmAction,
    alertState,
    setAlertState
  };
};