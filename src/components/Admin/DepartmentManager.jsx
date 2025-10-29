import React, { useState, useEffect, useMemo } from 'react';
import departmentService from '../../firebase/departments';
import officeService from '../../firebase/office';
import { Button, Input, Select, Loading, ModalContainer } from '../index';
import { useDepartmentForm } from '../../hooks/useDepartmentForm';
import { useModal } from '../../contexts/ModalContext';
import { PlusCircle, Edit, Trash2, Building, ChevronDown, ChevronRight } from 'lucide-react';
import { Controller } from 'react-hook-form';

const OfficeDepartments = ({ office, departments, handleOpenForm, handleDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      <button
        className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Building size={20} className="mr-3 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {office ? office.officeName : 'Global Departments'}
          </h3>
        </div>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {isOpen && (
        <div className="pb-1">
          {departments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Id</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{dept.departmentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dept.departmentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{dept.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            dept.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-4">
                          <button onClick={() => handleOpenForm(dept)} className="text-blue-600 hover:text-blue-900">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(dept)} className="text-red-600 hover:text-red-900">
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
            <p className="text-center text-gray-500 py-4">No departments in this office.</p>
          )}
        </div>
      )}
    </div>
  );
};

function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  const { 
    formMethods, 
    isDepartmentFormOpen, 
    openDepartmentForm, 
    closeDepartmentForm, 
    editingDepartment, 
    handleFormSubmit, 
    isSubmitting 
  } = useDepartmentForm();
  const { register, handleSubmit, control, formState: { errors } } = formMethods;
  const { showModal } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptList, officeList] = await Promise.all([
          departmentService.getAllDepartments(),
          officeService.getAllOffices()
        ]);
        setDepartments(deptList);
        setOffices(officeList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenForm = (department = null) => {
    openDepartmentForm(department, {
      onSuccess: (data) => {
        if (department) {
          setDepartments(departments.map(d => d.id === data.id ? data : d));
        } else {
          setDepartments(prev => [data, ...prev]);
        }
      }
    });
  };

  const handleDelete = (department) => {
    showModal({
      title: 'Delete Department',
      message: `Are you sure you want to delete ${department.departmentName}? This action cannot be undone.`,
      confirmText: 'Delete Department',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          await departmentService.deleteDepartment(department.id);
          setDepartments(departments.filter(d => d.id !== department.id));
        } catch (error) {
          console.error('Error deleting department:', error);
        }
      }
    });
  };

  const departmentsByOffice = useMemo(() => {
    const grouped = offices.reduce((acc, office) => {
      acc[office.officeId] = {
        office,
        departments: [],
      };
      return acc;
    }, {});

    const globalDepartments = [];

    departments.forEach(dept => {
      if (dept.office_id && grouped[dept.office_id]) {
        grouped[dept.office_id].departments.push(dept);
      } else {
        globalDepartments.push(dept);
      }
    });

    const result = Object.values(grouped);
    if (globalDepartments.length > 0) {
      result.push({ office: null, departments: globalDepartments });
    }

    return result;
  }, [departments, offices]);

  if (loading) return <Loading isOpen={true} message="Loading departments..." />;

  return (
    <div className="space-y-6">
      <div className="w-full flex flex-col md:flex-row justify-between mb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Department Management</h2>
          <p className="text-gray-600">Create and manage departments across offices</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => handleOpenForm()} variant="primary" className="!rounded-lg !w-fit">
            <PlusCircle size={20} className="mr-2" /> Add Department
          </Button>
        </div>
      </div>

      {departmentsByOffice.map(({ office, departments }) => (
        <OfficeDepartments
          key={office ? office.officeId : 'global'}
          office={office}
          departments={departments}
          handleOpenForm={handleOpenForm}
          handleDelete={handleDelete}
        />
      ))}

      {departments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <p className="text-gray-500 text-lg">No departments found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first department to get started</p>
        </div>
      )}

      <ModalContainer isOpen={isDepartmentFormOpen} onClose={closeDepartmentForm} className="max-w-2xl !p-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">
            {editingDepartment ? 'Edit Department' : 'Create New Department'}
          </h2>
          <p className="text-blue-200">Manage department details and assignments</p>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
          <Input
            label="Department ID"
            {...register('departmentId', { 
              required: 'Department ID is required',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Only lowercase letters, numbers, and underscores allowed'
              }
            })}
            error={errors.departmentId?.message}
            placeholder="e.g., sales_dept"
          />
          
          <Input
            label="Department Name"
            {...register('departmentName', { required: 'Department name is required' })}
            error={errors.departmentName?.message}
            placeholder="e.g., Sales Department"
          />
          
          <Input
            label="Description"
            {...register('description')}
            as="textarea"
            rows={3}
            placeholder="Describe the department's purpose..."
          />
          
          <Controller
            name="office_id"
            control={control}
            rules={{
              required: 'Please select Office',
              validate: (value) => value !== 'Select an office' || 'Please select Office',
            }}
            render={({ field }) => (
              <Select
                label="Office"
                placeholder="Select an office"
                defaultValue="Select an office"
                {...field}
                options={[
                  { value: '', name: 'Global (All Offices)' },
                  ...offices.map(office => ({
                    value: office.officeId,
                    name: office.officeName
                  }))
                ]}
                error={errors.office_id?.message} 
              />
            )}
          />
          
          <Select
            label="Status"
            {...register('status')}
            options={[
              { value: 'active', name: 'Active' },
              { value: 'inactive', name: 'Inactive' }
            ]}
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={closeDepartmentForm} disabled={isSubmitting} className="!w-full">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="!w-full">
              {isSubmitting ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </div>
  );
}

export default DepartmentManager;