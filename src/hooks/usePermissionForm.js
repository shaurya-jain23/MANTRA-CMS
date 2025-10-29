import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import permissionService from '../firebase/permissions';
import toast from 'react-hot-toast';

export const usePermissionForm = () => {
  const [isPermissionFormOpen, setIsPermissionFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const formMethods = useForm({
    defaultValues: editingPermission || { status: 'active' },
  });
  const { reset } = formMethods;

  useEffect(() => {
    if (isPermissionFormOpen) {
      if (editingPermission) {
        reset(editingPermission);
      } else {
        reset({
          permissionId: '',
          permissionName: '',
          description: '',
          status: 'active',
          resource: '',
          action: '',
          category: '',
          riskLevel: 'low',
          isSystemPermission: false,
        });
      }
    }
  }, [editingPermission, isPermissionFormOpen, reset]);

  const openPermissionForm = useCallback((editPermission = null, config = {}) => {
    setEditingPermission(editPermission);
    setIsPermissionFormOpen(true);
    setModalConfig(config);
  }, []);

  const closePermissionForm = useCallback(() => {
    setIsPermissionFormOpen(false);
    setEditingPermission(null);
    setModalConfig({});
    reset();
  }, [reset]);

  const handlePermissionSuccess = useCallback(
    (data) => {
      if (modalConfig.onSuccess) {
        modalConfig.onSuccess(data);
      }
      closePermissionForm();
    },
    [modalConfig, closePermissionForm]
  );

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      editingPermission ? 'Updating permission...' : 'Creating new permission...'
    );
    try {
      if (editingPermission) {
        await permissionService.updatePermission(editingPermission.id, data);
        handlePermissionSuccess({ ...editingPermission, ...data });
      } else {
        const newPermission = await permissionService.createPermission(data);
        handlePermissionSuccess(newPermission);
      }
    } catch (error) {
      console.error('Permission Form Error:', error);
      toast.error(error.message || 'Failed to process permission.');
    } finally {
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    isPermissionFormOpen,
    openPermissionForm,
    closePermissionForm,
    editingPermission,
    handleFormSubmit,
    isSubmitting,
  };
};
