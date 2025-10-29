import React, { useState, useEffect } from 'react';
import officeService from '../../firebase/office';
import { Button, Input, Select, Loading, ModalContainer } from '../index';
import { useOfficeForm } from '../../hooks/useOfficeForm';
import { useModal } from '../../contexts/ModalContext';
import { PlusCircle } from 'lucide-react';

function OfficeManager() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    formMethods,
    isOfficeFormOpen,
    openOfficeForm,
    closeOfficeForm,
    editingOffice,
    handleFormSubmit,
    isSubmitting,
  } = useOfficeForm();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = formMethods;
  const { showModal } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const officeList = await officeService.getAllOffices();
        setOffices(officeList);
      } catch (error) {
        console.error('Error fetching offices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenForm = (office = null) => {
    if (office) {
      openOfficeForm(office, {
        onSuccess: (updatedOffice) => {
          if (updatedOffice) {
            setOffices(offices.map((o) => (o.id === updatedOffice.id ? updatedOffice : o)));
          } else {
            fetchData();
          }
        },
      });
    } else {
      openOfficeForm(null, {
        onSuccess: (newOffice) => {
          if (newOffice) {
            setOffices((prevOffices) => [newOffice, ...prevOffices]);
          } else {
            fetchData();
          }
        },
      });
    }
  };

  const handleDelete = (office) => {
    showModal({
      title: 'Delete Office',
      message: `Are you sure you want to delete ${office.officeName}? This will affect all users in this office.`,
      confirmText: 'Delete Office',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          await officeService.deleteOffice(office.id);
          setOffices(offices.filter((o) => o.id !== office.id));
        } catch (error) {
          console.error('Error deleting office:', error);
          toast.error('Failed to delete office.');
        }
      },
    });
  };

  if (loading) return <Loading isOpen={true} message="Loading offices..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row justify-between mb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Office Management</h2>
          <p className="text-gray-600">Create and manage office locations</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => handleOpenForm()}
            variant="primary"
            className="!rounded-4xl !w-fit"
          >
            <PlusCircle size={20} className="mr-2" /> Add Office
          </Button>
        </div>
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offices.map((office) => (
          <div key={office.id} className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{office.officeName}</h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  office.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {office.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">District:</span> {office.district}
              </div>
              <div>
                <span className="font-medium">State:</span> {office.state}
              </div>
              {office.address && (
                <div>
                  <span className="font-medium">Address:</span> {office.address}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleOpenForm(office)}
                className="!w-fit !px-3"
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleDelete(office)}
                className="!w-fit !px-3 !bg-red-100 !text-red-700 hover:!bg-red-200"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {offices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <p className="text-gray-500 text-lg">No offices found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first office to get started</p>
        </div>
      )}

      {/* Office Form Modal */}
      <ModalContainer
        isOpen={isOfficeFormOpen}
        onClose={closeOfficeForm}
        className="max-w-2xl !p-0"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">
            {editingOffice ? 'Edit Office' : 'Register New Office'}
          </h2>
          <p className="text-blue-200">Manage office details and location information</p>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
          <Input
            label="Office ID"
            {...register('officeId', {
              required: 'Office ID is required',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Only lowercase letters, numbers, and underscores allowed',
              },
            })}
            error={errors.officeId?.message}
            placeholder="e.g., hisar_001"
          />

          <Input
            label="Office Name"
            {...register('officeName', { required: 'Office name is required' })}
            error={errors.officeName?.message}
            placeholder="e.g., Hisar Office"
          />

          <Input
            label="District"
            {...register('district', { required: 'District is required' })}
            error={errors.district?.message}
            placeholder="e.g., Hisar"
          />

          <Input
            label="State"
            {...register('state', { required: 'State is required' })}
            error={errors.state?.message}
            placeholder="e.g., Haryana"
          />

          <Input
            label="Address"
            {...register('address')}
            as="textarea"
            rows={3}
            placeholder="Full office address..."
          />

          <Select
            label="Status"
            {...register('status')}
            options={[
              { value: 'active', name: 'Active' },
              { value: 'inactive', name: 'Inactive' },
            ]}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeOfficeForm}
              disabled={isSubmitting}
              className="!w-full"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="!w-full">
              {isSubmitting ? 'Saving...' : editingOffice ? 'Update Office' : 'Register Office'}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </div>
  );
}

export default OfficeManager;
