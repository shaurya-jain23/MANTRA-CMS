import React, { createContext, useContext, useState } from 'react';
import {ConfirmationAlert} from '../components';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmColor: 'bg-blue-600',
    icon: null,
  });

  const showModal = (modalConfig) => {
    setModal({ ...modalConfig, isOpen: true });
  };

  const hideModal = () => {
    setModal({ ...modal, isOpen: false, title: '',  message: '', onConfirm: null});
  };

  

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <ConfirmationAlert
        isOpen={modal.isOpen}
        onClose={hideModal}
        onConfirm={handleConfirm}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        confirmColor={modal.confirmColor}
        icon={modal.icon}
      />
    </ModalContext.Provider>
  );
};