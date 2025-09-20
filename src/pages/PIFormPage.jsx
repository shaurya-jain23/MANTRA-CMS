import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import piService from '../firebase/piService';
import generatePIPDF from '../assets/generatePI';
import { CreateInvoice, Container, Loading } from '../components';

function PIFormPage() {
    const navigate = useNavigate();
    const { piId } = useParams(); // For editing
    const [piNumber, setPiNumber] = useState('');
    const [piToEdit, setPiToEdit] = useState(null);
    const [loading, setLoading] = useState(true);
    const userData = useSelector(selectUser);

    useEffect(() => {
        if (piId) { // Editing mode
        piService.getPINumber(piId).then(data => {
            setPiToEdit(data);
            setPiNumber(data.pi_number);
            setLoading(false);
        });
        } else { // Creating mode
        piService.getPINumber().then(setPiNumber).finally(() => setLoading(false));
        }
    }, [piId]);

    const handleFormSubmit = async (piData) => {
      if (piId) { 
        await piService.updatePI(piId, piData);
        navigate(`/pi/${piId}`);
      } else { // Create new PI
        const newPiId = await piService.addPI(piData);
        // navigate(`/pi/${newPiId}`);
        navigate(`/all-pis`);
      }
    };
  
  
  const handleDownload = async (data) => {
    const selectedDealer = dealers.find(d => d.id === data.dealerId);
    const piData = {
      ...data,
      pi_number: piNumber,
      pi_date: new Date().toLocaleDateString(),
      sales_person_name: userData.displayName,
      sales_person_contact: userData.phone,
      dealer: selectedDealer,
      // You would need to add logic to calculate totals
      grand_total: (data.products[0].qty * data.products[0].unit_price) // Simplified total
    };

    generatePIPDF(piData);
    await piService.savePIData(piData);
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
