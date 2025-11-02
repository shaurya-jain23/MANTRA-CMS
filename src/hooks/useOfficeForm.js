// src/hooks/useOfficeForm.js
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import officeService from '../firebase/office';
import toast from 'react-hot-toast';

export const useOfficeForm = () => {
  const [isOfficeFormOpen, setIsOfficeFormOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const formMethods = useForm({
    defaultValues: editingOffice || { status: 'active' },
  });
  const { reset } = formMethods;

  useEffect(() => {
    if (isOfficeFormOpen) {
      if (editingOffice) {
        reset(editingOffice);
      } else {
        reset({
          officeId: '',
          officeName: '',
          district: '',
          state: '',
          address: '',
          status: 'active',
        });
      }
    }
  }, [editingOffice, isOfficeFormOpen, reset]);

  const openOfficeForm = useCallback((editOffice = null, config = {}) => {
    setEditingOffice(editOffice);
    setIsOfficeFormOpen(true);
    setModalConfig(config);
  }, []);

  const closeOfficeForm = useCallback(() => {
    setIsOfficeFormOpen(false);
    setEditingOffice(null);
    setModalConfig({});
    reset();
  }, [reset]);

  const handleOfficeSuccess = useCallback(
    (data) => {
      if (modalConfig.onSuccess) {
        modalConfig.onSuccess(data);
      }
      closeOfficeForm();
    },
    [modalConfig, closeOfficeForm]
  );

  // Enhanced error handling
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      editingOffice ? 'Updating office...' : 'Registering new office...'
    );
    try {
      if (editingOffice) {
        await officeService.updateOffice(editingOffice.id, data);
        toast.success('Office updated successfully!');
        handleOfficeSuccess({ ...editingOffice, ...data });
      } else {
        const newOffice = await officeService.createOffice(data);
        toast.success('Office registered successfully!');
        handleOfficeSuccess(newOffice);
      }
    } catch (error) {
      console.error('Office Form Error:', error);
      toast.error(error.message || 'Failed to process office.');
    } finally {
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    isOfficeFormOpen,
    openOfficeForm,
    closeOfficeForm,
    editingOffice,
    handleFormSubmit,
    isSubmitting,
  };
};
