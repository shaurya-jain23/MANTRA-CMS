import React, { createContext, useContext, useState, useCallback } from 'react';
import {DealerForm} from '../components'; // Adjust path as needed

const DealerContext = createContext();

export const useDealer = () => {
  const context = useContext(DealerContext);
  if (!context) {
    throw new Error('useDealer must be used within a DealerProvider');
  }
  return context;
};

export const DealerProvider = ({ children }) => {
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [dealerToEdit, setDealerToEdit] = useState(null);
  const [modalConfig, setModalConfig] = useState({});

  const openDealerModal = useCallback((editDealer = null, config = {}) => {
    setDealerToEdit(editDealer);
    setIsDealerModalOpen(true);
    setModalConfig(config);
  }, []);
  

  const closeDealerModal = useCallback(() => {
    setIsDealerModalOpen(false);
    setDealerToEdit(null);
    setModalConfig({});
  }, []);

  const handleDealerSuccess = useCallback((data) => {
    if (modalConfig.onSuccess) {
      modalConfig.onSuccess(data);
    }
    closeDealerModal();
  }, [modalConfig, closeDealerModal]);

  const value = {
    // State
    isDealerModalOpen,
    dealerToEdit,
    
    // Actions
    openDealerModal,
    closeDealerModal,
    setDealerToEdit,
  };

  return (
    <DealerContext.Provider value={value}>
      {children}
      <DealerForm onSuccess={handleDealerSuccess}/>
    </DealerContext.Provider>
  );
};