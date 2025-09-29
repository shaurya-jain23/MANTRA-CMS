import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../features/user/userSlice';
import piService from '../../firebase/piService';
import {toast} from 'react-hot-toast';
import { CreateInvoice, Container, Loading } from '../../components';
import { fetchPis, selectPIStatus, setPIStatus, selectPIById } from '../../features/performa-invoices/PISlice';

function PIFormPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { piId } = useParams(); // For editing
    const [piNumber, setPiNumber] = useState('');
    const piToEdit = useSelector((state) => selectPIById(state, piId)) || null;
    const [loading, setLoading] = useState(true);
    const userData = useSelector(selectUser);
    const PIStatus = useSelector(selectPIStatus);
    
    // Fetch PIs based on user role
    useEffect(() => {
      if(piId){
        if (PIStatus === 'idle' && userData) {
          dispatch(fetchPis({ role: userData.role, userId: userData.uid }));
        }
        if(PIStatus === 'succeeded' && piToEdit){
          setPiNumber(piToEdit?.pi_number)
          setLoading(false);
        }
        if(PIStatus === 'failed'){
          setError('Failed to fetch PIs.')
          setLoading(false)
        }
      }
      else{
        piService.getPINumber().then(setPiNumber).finally(() => setLoading(false));
      }
      }, [PIStatus, dispatch, userData, piId, piToEdit]);


    const handleFormSubmit = async (piData) => {
      const toastId = toast.loading(piId ? 'Updating the Performa Invoice...' : 'Creating the Performa Invoice...');
      if (piId) { 
        await piService.updatePI(piId, piData);
        dispatch(setPIStatus("idle"))
        navigate(`/performa-invoices/${piId}`);
        // navigate(`/performa-invoices`);
      } else { // Create new PI
        const newPiId = await piService.addPI(piData);
        dispatch(setPIStatus("idle"))
        navigate(`/performa-invoices/${newPiId}`);
        // navigate(`/performa-invoices`);
      }
      toast.dismiss(toastId);
    };
  
  
  // A simplified structure for the form
  // --- RENDER LOGIC ---
  if (loading) {
    return <Loading isOpen={true} message="Loading Page..." />
  }
  return (
    <Container>
         <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Container Perform Invoice
            </h1>
            <CreateInvoice 
                piNumber={piNumber} 
                onSubmit={handleFormSubmit} 
                piToEdit={piToEdit} 
            />
      </div>
    </Container>
   
  );
}
export default PIFormPage;
