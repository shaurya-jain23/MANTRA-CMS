import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import roleService from '../firebase/roles';
import toast from 'react-hot-toast';

export const useRoleForm = () => {
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const formMethods = useForm({
    defaultValues: editingRole || { status: 'active', isGlobal: false },
  });
  const { reset } = formMethods;

  useEffect(() => {
    if (isRoleFormOpen) {
      if (editingRole) {
        reset(editingRole);
      } else {
        reset({
          roleId: '',
          roleName: '',
          departmentId: '',
          permissions: [],
          officeId: '',
          isGlobal: false,
          status: 'active',
          level: 1,
        });
      }
    }
  }, [editingRole, isRoleFormOpen, reset]);

  const openRoleForm = useCallback((editRole = null, config = {}) => {
    setEditingRole(editRole);
    setIsRoleFormOpen(true);
    setModalConfig(config);
  }, []);

  const closeRoleForm = useCallback(() => {
    setIsRoleFormOpen(false);
    setEditingRole(null);
    setModalConfig({});
    reset();
  }, [reset]);

  const handleRoleSuccess = useCallback(
    (data) => {
      if (modalConfig.onSuccess) {
        modalConfig.onSuccess(data);
      }
      closeRoleForm();
    },
    [modalConfig, closeRoleForm]
  );

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingRole ? 'Updating role...' : 'Creating new role...');
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, data);
        handleRoleSuccess({ ...editingRole, ...data });
      } else {
        const newRole = await roleService.createRole(data);
        handleRoleSuccess(newRole);
      }
    } catch (error) {
      console.error('Role Form Error:', error);
      toast.error(error.message || 'Failed to process role.');
    } finally {
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    isRoleFormOpen,
    openRoleForm,
    closeRoleForm,
    editingRole,
    handleFormSubmit,
    isSubmitting,
    handleRoleSuccess,
  };
};