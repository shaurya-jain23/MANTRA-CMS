import React, { useState, useEffect, useMemo } from 'react';
import { ModalContainer, Input, Button, Select, FormStepper, SearchBar } from '../../index';
import Checkbox from '../../CheckBox';
import { Controller } from 'react-hook-form';
import permissionService from '../../../firebase/permissions';
import roleService from '../../../firebase/roles';
import { ChevronLeft, ChevronRight, Copy, Shield, CheckCircle, Wrench, FileText, ShieldCheck, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { roleLevels } from '../../../assets/utils';

// Helper component for individual permission resource
const PermissionResource = ({ 
  resource, 
  permissions, 
  selectedPermissions, 
  onPermissionChange,
  onSelectAll 
}) => {
  const resourcePermissions = permissions.filter(p => p.resource === resource);
  const allSelected = resourcePermissions.every(p => selectedPermissions[p.permissionId]);
  const someSelected = resourcePermissions.some(p => selectedPermissions[p.permissionId]) && !allSelected;

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <label htmlFor={`select-all-${resource}`} className="font-medium text-gray-900">
            {resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
        </div>
        <Button
          size="small"
          variant="ghost"
          onClick={() => onSelectAll(resource, resourcePermissions)}
        >
          {allSelected ? 'Full Control' : someSelected ? 'Partial Control' : 'Select All'}
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        {resourcePermissions.map(permission => (
          <div key={permission.permissionId} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <label htmlFor={permission.permissionId} className="font-medium text-gray-900 text-sm">
                  {permission.permissionName} ({permission.action.replace(/_/g, ' ')})
                </label>
                <p className="text-xs text-gray-500">{permission.description}</p>
              </div>
            </div>
               <label className="inline-flex items-center cursor-pointer">
                <input id={permission.permissionId} type="checkbox" checked={!!selectedPermissions[permission.permissionId]} onChange={(e) => onPermissionChange(permission.permissionId, e.target.checked)} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 1: Basic Information
const BasicInfoStep = ({ formMethods, offices, allDepartments, watch }) => {
  const { register, control, formState: { errors } } = formMethods;
  const [departments, setDepartments] = useState([]);
  let isGlobal = watch('isGlobal');
  let officeId = watch('officeId');

  useEffect(() => {
    if (officeId && officeId !== 'Select an office') {
      const filteredDepartments = allDepartments.filter(dept => dept.officeId === officeId);
      setDepartments(filteredDepartments);
    } else {
      setDepartments([]);
    }
  }, [officeId, allDepartments]);

  return (
    <div className="space-y-4">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label="Role ID"
          {...register('roleId', {
            required: 'Role ID is required',
            pattern: {
              value: /^[a-z0-9_]+$/,
              message: 'Lowercase letters, numbers, and underscores only.',
            },
          })}
          error={errors.roleId?.message}
          placeholder="e.g., sales_manager"
        />
        <Input
          label="Role Name"
          {...register('roleName', { 
            required: 'Role name is required', 
          })}
          error={errors.roleName?.message}
          placeholder="e.g., Sales Manager"
        />
      </div>
      <Input
        label="Description"
        {...register('description')}
        as="textarea"
        rows={1}
        placeholder="Describe the role's responsibilities and scope..."
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="level"
          control={control}
          rules={{ required: 'Level is required', validate: (value) => value !== '-- Select Level --' || 'Please select level', }}
          render={({ field }) => (
            <Select
              placeholder="-- Select Level --"
              defaultValue="-- Select Level --"
              label="Hierarchy Level"
              required
              {...field}
              options={roleLevels}
              error={errors.level?.message}
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          rules={{ required: 'Status is required' }}
          render={({ field }) => (
            <Select
              label="Status"
              {...field}
              required
              options={[
                { value: 'active', name: 'Active' },
                { value: 'inactive', name: 'Inactive' },
              ]}
            />
          )}
        />
      </div>

      <Checkbox
        label="Global Role"
        {...register('isGlobal')}
        description="This role will be available across all offices"
      />
      <div className='grid grid-cols-2 gap-4'>
      {!isGlobal && (
        <Controller
            name="officeId"
            control={control}
            rules={{
              required: 'Office is required for non-global roles',
              validate: (value) => value !== 'Select an office' || 'Please select Office',
            }}
            render={({ field }) => (
              <Select
                label="Office"
                placeholder="Select an office"
                defaultValue="Select an office"
                {...field}
                required
                options={[
                  ...offices.map((office) => ({
                    value: office.officeId,
                    name: office.officeName,
                  })),
                ]}
                error={errors.officeId?.message}
              />
              )}
          />
      )}
      <Controller
          name="departmentId"
          control={control}
          rules={{
            required: 'Department is required',
            validate: (value) => value !== 'Select department' || 'Please select department',
          }}
          render={({ field }) => (
            <Select
              label="Department"
              defaultValue="Select department"
              placeholder="Select department"
              {...field}
              required
              options={
                isGlobal
                  ? allDepartments.map((dept) => ({
                      value: dept.departmentId,
                      name: dept.departmentName,
                    }))
                  : departments.map((dept) => ({
                      value: dept.departmentId,
                      name: dept.departmentName,
                    }))
              }
              disabled={isGlobal && departments.length === 0}
              error={errors.departmentId?.message}
            />
          )}
        />
      </div>
    </div>
  );
};

// Step 2: Permissions Assignment
const PermissionsStep = ({ 
  permissions, 
  selectedPermissions, 
  onPermissionChange, 
  onSelectAll,
  existingRoles,
  onCopyFromRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleToCopy, setSelectedRoleToCopy] = useState('');

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return permissions;
    return permissions.filter(perm => 
      perm.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  const permissionsByResource = useMemo(() => {
    const grouped = {};
    filteredPermissions.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  }, [filteredPermissions]);

  const handleCopyFromRole = async () => {
    if (!selectedRoleToCopy) return;
    
    try {
      const role = await roleService.getRoleById(selectedRoleToCopy);
      if (role && role.permissions) {
        // Set all permissions from the selected role
        Object.keys(role.permissions).forEach(permId => {
          onPermissionChange(permId, true);
        });
        toast.success(`Permissions copied from ${role.roleName}`);
      }
    } catch (error) {
      toast.error('Failed to copy permissions from role');
    }
  };

  return (
    <div className="space-y-4">
      {/* Copy from existing role */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Copy from existing role</h4>
            <p className="text-blue-700 text-sm">Quickly apply permissions from another role</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedRoleToCopy}
              onChange={(e) => setSelectedRoleToCopy(e.target.value)}
              options={[
                { value: '', name: 'Select a role to copy from' },
                ...existingRoles.map(role => ({
                  value: role.id,
                  name: `${role.roleName} (${role.officeId || 'Global'})`,
                }))
              ]}
              className="min-w-64"
            />
            <Button
              variant="primary"
              size="small"
              onClick={handleCopyFromRole}
              disabled={!selectedRoleToCopy}
            >
              <Copy size={16} className="mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        query={searchTerm}
        setQuery={setSearchTerm}
        className="rounded-xs py-2"
        resultCount={filteredPermissions.length}
        placeholder="Search permissions..."
      />
      {/* Permissions List */}
      <div className="overflow-y-auto">
        {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
          <PermissionResource
            key={resource}
            resource={resource}
            permissions={resourcePermissions}
            selectedPermissions={selectedPermissions}
            onPermissionChange={onPermissionChange}
            onSelectAll={onSelectAll}
          />
        ))}
        
        {filteredPermissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No permissions found matching your search.
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Selected: {Object.values(selectedPermissions).filter(Boolean).length} permissions
        </p>
      </div>
    </div>
  );
};

// Step 3: Review & Confirm
const ReviewStep = ({ formValues, selectedPermissions, permissions }) => {
  const selectedPermissionsList = Object.keys(selectedPermissions).filter(key => selectedPermissions[key]);
  const permissionDetails = selectedPermissionsList.map(permId => 
    permissions.find(p => p.permissionId === permId)
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-2" size={20} />
          <h3 className="font-medium text-green-800">Ready to create role</h3>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Review the details below before saving the role.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Role Details</h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Role Name</dt>
              <dd className="font-medium">{formValues.roleName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Role ID</dt>
              <dd className="font-mono text-sm">{formValues.roleId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Level</dt>
              <dd className="font-medium">Level {formValues.level}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Scope</dt>
              <dd className="font-medium">
                {formValues.isGlobal ? 'Global Role' : `${formValues.officeId} Office`}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Department</dt>
              <dd className="font-medium">{formValues.departmentId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize">{formValues.status}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Permissions ({selectedPermissionsList.length})
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {permissionDetails.map(perm => (
              <div key={perm.permissionId} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{perm.permissionName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {perm.resource.replace(/_/g, ' ')} • {perm.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <Shield size={16} className="text-gray-400" />
              </div>
            ))}
            
            {selectedPermissionsList.length === 0 && (
              <p className="text-gray-500 text-sm">No permissions selected</p>
            )}
          </div>
        </div>
      </div>

      {formValues.description && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {formValues.description}
          </p>
        </div>
      )}
    </div>
  );
};

function RolePermissionsModal({ formProps, offices = [], allDepartments = [], allRoles=[] }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  
  const {
    formMethods,
    isRoleFormOpen,
    editingRole,
    isSubmitting,
    closeRoleForm,
    handleFormSubmit,
  } = formProps;
  
  const {
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = formMethods;

  // Fetch permissions and existing roles when modal opens
  useEffect(() => {
    if (isRoleFormOpen) {
      fetchPermissions();
      // If editing, set selected permissions
      if (editingRole && editingRole.permissions) {
        setSelectedPermissions(editingRole.permissions);
      } else {
        setSelectedPermissions({});
      }
      
      setCurrentStep(1);
    }
  }, [isRoleFormOpen, editingRole]);

  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const allPermissions = await permissionService.getAllPermissions();
      setPermissions(allPermissions);
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };


  const handlePermissionChange = (permissionId, isSelected) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: isSelected
    }));
  };

  const handleSelectAll = (resource, resourcePermissions) => {
    const allCurrentlySelected = resourcePermissions.every(p => selectedPermissions[p.permissionId]);
    
    const updatedPermissions = { ...selectedPermissions };
    resourcePermissions.forEach(perm => {
      updatedPermissions[perm.permissionId] = !allCurrentlySelected;
    });
    
    setSelectedPermissions(updatedPermissions);
  };

  const handleFormSubmitWithPermissions = async (data) => {
    const roleData = {
      ...data,
      permissions: selectedPermissions
    };
    
    await handleFormSubmit(roleData);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: FileText },
    { number: 2, title: 'Assign Permissions', icon: Wrench },
    { number: 3, title: 'Review & Confirm' , icon: ShieldCheck },
  ];

 

  return (
    <ModalContainer
      isOpen={isRoleFormOpen}
      onClose={closeRoleForm}
      title={editingRole ? 'Edit Role' : 'Create Role'}
      className="max-w-4xl !p-0"
    >
      {/* Header */}
          <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <p className="text-blue-100">Manage role details and permission assignments</p>
          </div>
           {loadingPermissions ? (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading permissions...</p>
                  </div>) :
            (<div className="flex-1 px-6 pt-6">
              <FormStepper steps={steps} currentStep={currentStep} />
              <form onSubmit={handleSubmit(currentStep === 3? handleFormSubmitWithPermissions : nextStep)} className="">
                {/* Step Content */}
                <div className="">
                  {currentStep === 1 && (
                    <BasicInfoStep 
                      formMethods={formMethods}
                      offices={offices}
                      allDepartments={allDepartments}
                      watch={watch}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <PermissionsStep
                      permissions={permissions}
                      selectedPermissions={selectedPermissions}
                      onPermissionChange={handlePermissionChange}
                      onSelectAll={handleSelectAll}
                      existingRoles={allRoles}
                      onCopyFromRole={() => {}}
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <ReviewStep
                      formValues={getValues()}
                      selectedPermissions={selectedPermissions}
                      permissions={permissions}
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className='sticky bottom-0 bg-white'>
                  <div className="flex justify-between items-center py-4 mt-4 border-t border-gray-200">
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={closeRoleForm}
                        disabled={isSubmitting}
                        className="rounded-full">
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={prevStep}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 rounded-full"
                        >
                          <ChevronLeft size={16}/>
                          Back
                        </Button>
                      )}
                      <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="!w-fit gap-2 rounded-full"
                    >
                      {currentStep === 3 ? (
                        <>
                          {isSubmitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                          <ShieldCheck size={16} />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight size={16} />
                        </>
                      )}
                    </Button>
                    </div>
                  </div>
                </div>
              </form>
          </div>)}
    </ModalContainer>
  );
}

export default RolePermissionsModal;