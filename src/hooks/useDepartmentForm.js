import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import departmentService from '../firebase/departments';
import toast from 'react-hot-toast';

export const useDepartmentForm = () => {
  const [isDepartmentFormOpen, setIsDepartmentFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const formMethods = useForm({
    defaultValues: editingDepartment || {status: 'active'},
  });
  const { reset } = formMethods;

  useEffect(() => {
    if (isDepartmentFormOpen) {
      if (editingDepartment) {
        reset(editingDepartment);
      } else {
        reset({
          departmentId: '',
          departmentName: '',
          description: '',
          status: 'active',
        });
      }
    }
  }, [editingDepartment, isDepartmentFormOpen, reset]);

  const openDepartmentForm = useCallback((editDepartment = null, config = {}) => {
    setEditingDepartment(editDepartment);
    setIsDepartmentFormOpen(true);
    setModalConfig(config);
  }, []);

  const closeDepartmentForm = useCallback(() => {
    setIsDepartmentFormOpen(false);
    setEditingDepartment(null);
    setModalConfig({});
    reset();
  }, [reset]);

  const handleDepartmentSuccess = useCallback(
    (data) => {
      if (modalConfig.onSuccess) {
        modalConfig.onSuccess(data);
      }
      closeDepartmentForm();
    },
    [modalConfig, closeDepartmentForm]
  );

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingDepartment ? 'Updating department...' : 'Creating new department...');
    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, data);
        toast.success('Department updated successfully!');
        handleDepartmentSuccess({ ...editingDepartment, ...data });
      } else {
        const newDepartment = await departmentService.createDepartment(data);
        toast.success('Department created successfully!');
        handleDepartmentSuccess(newDepartment);
      }
    } catch (error) {
      console.error('Department Form Error:', error);
      toast.error(error.message || 'Failed to process department.');
    } finally {
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    isDepartmentFormOpen,
    openDepartmentForm,
    closeDepartmentForm,
    editingDepartment,
    handleFormSubmit,
    isSubmitting,
  };
};