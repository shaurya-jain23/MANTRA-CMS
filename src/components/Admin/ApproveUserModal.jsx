import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Select, ModalContainer } from '../index';
import { CheckCircle, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

function UserManagementModal({ 
  isOpen,
  user, 
  offices, 
  departments, 
  roles, 
  onConfirm, 
  onCancel,
  isApprovalMode = false // true for pending users, false for editing existing users
}) {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      officeId: user?.officeId || '',
      department: user?.department || '',
      role: user?.role || '',
    },
  });

  const selectedOffice = watch('officeId');
  const selectedDepartment = watch('department');

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      reset({
        officeId: user.officeId || '',
        department: user.department || '',
        role: user.role || '',
      });
    }
  }, [isOpen, user, reset]);

  // Filter departments based on selected office
  useEffect(() => {
    if (selectedOffice && departments) {
      const depts = departments.filter(dept => dept.officeId === selectedOffice);
      setFilteredDepartments(depts);
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedOffice, departments]);

  // Filter roles based on selected department
  useEffect(() => {
    if (selectedDepartment && roles) {
      const applicableRoles = roles.filter(role => {
        // Global roles are available to everyone
        if (role.isGlobal) return true;
        
        // Department-specific roles must match selected department
        if (role.departmentId === selectedDepartment) return true;
        
        return false;
      });
      
      setFilteredRoles(applicableRoles);
    } else {
      setFilteredRoles([]);
    }
  }, [selectedDepartment, roles]);

  const onSubmit = async (data) => {
    const { officeId, department, role } = data;
    
    if (!officeId) {
      toast.error('Please select an office');
      return;
    }
    
    if (!department) {
      toast.error('Please select a department');
      return;
    }
    
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(role, officeId, department);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalContainer isOpen={isOpen} className="max-w-md !p-0">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {isApprovalMode ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <UserCog className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          {isApprovalMode ? 'Approve User' : 'Update User Details'}
        </h2>
        <p className="text-center text-blue-100">
          {isApprovalMode 
            ? `Approve ${user?.displayName || user?.email} and assign role` 
            : `Update office, department, and role for ${user?.displayName || user?.email}`}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{user?.displayName || 'Not set'}</span>
            </div>
            {user?.phone && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Office Selection */}
          <Controller
            name="officeId"
            control={control}
            rules={{ 
              required: 'Office is required',
              validate: value => value !== '' || 'Please select an office'
            }}
            render={({ field }) => (
              <Select
                label="Select Office *"
                {...field}
                options={[
                  { value: '', name: '-- Select Office --' },
                  ...offices.map(office => ({
                    value: office.officeId,
                    name: office.officeName
                  }))
                ]}
                error={errors.officeId?.message}
                required
              />
            )}
          />

          {/* Department Selection */}
          <Controller
            name="department"
            control={control}
            rules={{ 
              required: 'Department is required',
              validate: value => value !== '' || 'Please select a department'
            }}
            render={({ field }) => (
              <Select
                label="Select Department *"
                {...field}
                options={[
                  { value: '', name: '-- Select Department --' },
                  ...filteredDepartments.map(dept => ({
                    value: dept.departmentId,
                    name: dept.departmentName
                  }))
                ]}
                error={errors.department?.message}
                required
                disabled={!selectedOffice}
              />
            )}
          />

          {selectedOffice && filteredDepartments.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No departments found for the selected office.
                Please contact your administrator.
              </p>
            </div>
          )}

          {/* Role Selection */}
          <Controller
            name="role"
            control={control}
            rules={{ 
              required: 'Role is required',
              validate: value => value !== '' || 'Please select a role'
            }}
            render={({ field }) => (
              <Select
                label="Assign Role *"
                {...field}
                options={[
                  { value: '', name: '-- Select Role --' },
                  ...filteredRoles.map(role => ({
                    value: role.roleId,
                    name: `${role.roleName}${role.isGlobal ? ' (Global)' : ''}`
                  }))
                ]}
                error={errors.role?.message}
                required
                disabled={!selectedDepartment}
              />
            )}
          />

          {selectedDepartment && filteredRoles.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No roles found for the selected department.
                Please contact your administrator.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={`flex-1 ${isApprovalMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isApprovalMode ? 'Approving...' : 'Updating...') 
                : (isApprovalMode ? 'Approve User' : 'Update User')}
            </Button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
}

export default UserManagementModal;
