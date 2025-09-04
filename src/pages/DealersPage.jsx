import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/user/userSlice';
import dealerService from '../firebase/dealers';
import { Button, DealerCard, DealerForm, Container } from '../components';
import { PlusCircle } from 'lucide-react';
import { State } from 'country-state-city';

function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dealerToEdit, setDealerToEdit] = useState(null);
  const userData = useSelector(selectUser);

  // Fetch dealers based on user role
  useEffect(() => {
    if (userData?.uid) {
      setLoading(true);
      const fetchDealers = ['admin', 'superuser'].includes(userData.role)
        ? dealerService.getAllDealers()
        : dealerService.getDealersBySalesperson(userData.uid);
      
      fetchDealers
        .then(setDealers)
        .catch(() => setError('Failed to fetch dealers.'))
        .finally(() => setLoading(false));
    }
  }, [userData]);

  // Handlers for form and actions
  const handleOpenForm = (dealer = null) => {
    if(dealer){
        dealer.state = State.getStatesOfCountry('IN').find(s => s.name === dealer.state).isoCode;
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
    data.state = State.getStateByCodeAndCountry(data.state, 'IN').name.toUpperCase();
    data.district= data.district.toUpperCase();
    data.trade_name= data.trade_name.toUpperCase();

    if (dealerToEdit) { 
      await dealerService.updateDealer(dealerToEdit.id, data);
      setDealers(dealers.map(d => d.id === dealerToEdit.id ? { ...d, ...data } : d));
    } else { // Add new dealer
      const newDealer = await dealerService.addDealer(data, userData);
      setDealers([newDealer, ...dealers]);
    }
    handleCloseForm();
  };
  
  const handleStatusChange = async (dealerId, status) => {
      await dealerService.updateDealer(dealerId, { status });
      setDealers(dealers.map(d => d.id === dealerId ? { ...d, status } : d));
  };

  return (
    <Container>
      <div className="w-full flex flex-col justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dealer Management</h1>
        <div className="mt-6 flex justify-end">
            <Button
                onClick={() => handleOpenForm()}
                className="bg-blue-600 hover:bg-blue-700 transition md:w-auto flex items-center"
                >
                <PlusCircle size={20} className="mr-2"/> Register Dealer
            </Button>
        </div>
      </div>
      {loading && <p>Loading dealers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && dealers.length === 0 && (
        <p className="text-gray-600">No dealers found. Click "Register Dealer" to add a new dealer.</p>
      )}
      
      {!loading && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dealers.map(dealer => (
            <DealerCard 
              key={dealer.id} 
              dealer={dealer}
              onEdit={handleOpenForm}
              onStatusChange={handleStatusChange}
              userData={userData}
            />
          ))}
        </div>
      )}

      <DealerForm
        key={dealerToEdit ? dealerToEdit.id : "new"}
        dealerToEdit={dealerToEdit}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
        isOpen={isFormOpen}
      />
      
    </Container>
  );
}

export default DealersPage;

