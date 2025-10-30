import React, { useState, useEffect, useMemo } from 'react';
import permissionService from '../../firebase/permissions';
import { Button, Input, Select, Loading, ModalContainer, CollapsibleSection } from '../index';
import { usePermissionForm } from '../../hooks/usePermissionForm';
import { useModal } from '../../contexts/ModalContext';
import { PlusCircle, Edit, Trash2, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { PERMISSION_CATEGORIES, actionOptions } from '../../assets/utils';
import { Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

const CategoryPermissions = ({ categoryId, permissions, handleOpenForm, handleDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  const category = PERMISSION_CATEGORIES.find((c) => c.categoryId === categoryId);
  const categoryName = category.categoryName.replace(/\b\w/g, (l) => l.toUpperCase());
  const categoryIcon = category.icon;

  return (
    <>
    <CollapsibleSection
      id={categoryId}
      title={`${categoryIcon} ${categoryName}`}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      contentClassName="p-0"
      disabled={false}
    >
      <div className="pb-1">
          {permissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Permission
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Resource
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((perm) => (
                    <tr key={perm.id}>
                      <td className="px-6 py-4 text-left whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {perm.permissionName}
                        </div>
                        <div className="text-sm text-gray-500">#{perm.permissionId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {perm.resource
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{perm.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            perm.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {perm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleOpenForm(perm)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(perm)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No permissions in this category.</p>
          )}
        </div>
    </CollapsibleSection>
    </>
  );
};

function PermissionManager() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const {
    formMethods,
    isPermissionFormOpen,
    openPermissionForm,
    closePermissionForm,
    editingPermission,
    handleFormSubmit,
    isSubmitting,
  } = usePermissionForm();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = formMethods;
  const { showModal } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const permissionList = await permissionService.getAllPermissions();
        setPermissions(permissionList);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenForm = (permission = null) => {
    openPermissionForm(permission, {
      onSuccess: (data) => {
        if (permission) {
          setPermissions(permissions.map((p) => (p.id === data.id ? data : p)));
        } else {
          setPermissions((prev) => [data, ...prev]);
        }
      },
    });
  };

  const handleDelete = (permission) => {
    showModal({
      title: 'Delete Permission',
      message: `Are you sure you want to delete ${permission.permissionName}? This action cannot be undone.`,
      confirmText: 'Delete Permission',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          if(permission.isSystemPermission) {
            toast.error('System permissions cannot be deleted.');
            return;
          }
          await permissionService.deletePermission(permission.id);
          setPermissions(permissions.filter((p) => p.id !== permission.id));
        } catch (error) {
          toast.error('Error deleting permission:', error);
        }
      },
    });
  };

  const handleCreateDefaults = () => {
    showModal({
      title: 'Create Default Permissions',
      message:
        'This will create a standard set of permissions. Existing permissions with the same ID will be overwritten.',
      confirmText: 'Create Defaults',
      confirmColor: 'bg-blue-600',
      onConfirm: async () => {
        try {
          await permissionService.createDefaultPermissions();
          const permissionList = await permissionService.getAllPermissions();
          setPermissions(permissionList);
        } catch (error) {
          toast.error('Error creating default permissions:', error);
        }
      },
    });
  };

  const permissionsByCategory = useMemo(() => {
    const grouped = permissions.reduce((acc, perm) => {
      const category = perm.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    }, {});
    return Object.entries(grouped).sort(([catA], [catB]) => catA.localeCompare(catB));
  }, [permissions]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'category') {
        setResources(
          [...PERMISSION_CATEGORIES.find((cat) => cat.categoryId === value.category)?.resources] ||
            []
        );
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, setResources, PERMISSION_CATEGORIES]);

  if (loading) return <Loading isOpen={true} message="Loading permissions..." />;

  return (
    <div className="space-y-6">
      <div className="w-full flex flex-col md:flex-row justify-between mb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Permission Management</h2>
          <p className="text-gray-600">Define granular permissions for system resources</p>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button onClick={handleCreateDefaults} variant="secondary" className="!rounded-3xl !w-fit">
            Create Defaults
          </Button>
          <Button onClick={() => handleOpenForm()} variant="primary" className="!rounded-3xl !w-fit">
            <PlusCircle size={20} className="mr-2" /> Add Permission
          </Button>
        </div>
      </div>

      {permissionsByCategory.map(([category, perms]) => (
        <CategoryPermissions
          key={category}
          categoryId={category}
          permissions={perms}
          handleOpenForm={handleOpenForm}
          handleDelete={handleDelete}
        />
      ))}

      {permissions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <p className="text-gray-500 text-lg">No permissions found</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first permission or generate defaults.
          </p>
        </div>
      )}

      <ModalContainer
        isOpen={isPermissionFormOpen}
        onClose={closePermissionForm}
        className="max-w-2xl !p-0"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">
            {editingPermission ? 'Edit Permission' : 'Create New Permission'}
          </h2>
          <p className="text-blue-200">Manage permission details and assignments</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
          <Input
            label="Permission ID"
            {...register('permissionId', {
              required: 'Permission ID is required',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Only lowercase letters, numbers, and underscores allowed',
              },
            })}
            error={errors.permissionId?.message}
            placeholder="e.g., user_create"
          />

          <Input
            label="Permission Name"
            {...register('permissionName', { required: 'Permission name is required' })}
            error={errors.permissionName?.message}
            placeholder="e.g., Create Users"
          />
          <Input
            label="Description"
            {...register('description')}
            as="textarea"
            rows={3}
            placeholder="Describe the permission's purpose..."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="category"
              control={control}
              rules={{
                required: 'Category is required',
                validate: (value) =>
                  value !== '--Category--' || 'Please select permission category',
              }}
              render={({ field }) => (
                <Select
                  label="Category"
                  placeholder="--Category--"
                  {...field}
                  defaultValue="--Category--"
                  options={PERMISSION_CATEGORIES.map((cat) => ({
                    value: cat.categoryId,
                    name: cat.categoryName?.replace(/\b\w/g, (l) => l.toUpperCase()),
                  }))}
                  error={errors.category?.message}
                />
              )}
            />
            <Controller
              name="resource"
              control={control}
              rules={{
                required: 'Permission resource is required',
                validate: (value) =>
                  value !== '--Resource--' || 'Please select permission resource',
              }}
              render={({ field }) => (
                <Select
                  label="Resource"
                  defaultValue="--Resource--"
                  placeholder="--Resource--"
                  {...field}
                  options={resources.map((res) => ({
                    value: res,
                    name: res.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  }))}
                  disabled={resources.length === 0}
                  error={errors.resource?.message}
                />
              )}
            />
            <Controller
              name="action"
              control={control}
              rules={{
                required: 'Permission action is required',
                validate: (value) => value !== '--Action--' || 'Please select permission action',
              }}
              render={({ field }) => (
                <Select
                  label="Action"
                  defaultValue="--Action--"
                  placeholder="--Action--"
                  {...field}
                  options={actionOptions.map((act) => ({
                    value: act,
                    name: act.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  }))}
                  error={errors.action?.message}
                />
              )}
            />
          </div>
           <div className="flex justify-between items-center space-x-4">
              <Select
                label="Status"
                {...register('status')}
                options={[
                  { value: 'active', name: 'Active' },
                  { value: 'inactive', name: 'Inactive' },
                ]}
              />
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('isSystemPermission')} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  System Permission
                </span>
              </label>
           </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closePermissionForm}
              disabled={isSubmitting}
              className="!w-full"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="!w-full">
              {isSubmitting
                ? 'Saving...'
                : editingPermission
                  ? 'Update Permission'
                  : 'Create Permission'}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </div>
  );
}

export default PermissionManager;
