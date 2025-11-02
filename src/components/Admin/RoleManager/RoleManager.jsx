import React, { useState, useEffect, useMemo } from 'react';
import { Button, Loading, CollapsibleSection } from '../../index';
import RolePermissionsModal from './RolePermissionsModal';
import Checkbox from '../../CheckBox';
import { useRoleForm } from '../../../hooks/useRoleForm';
import { useModal } from '../../../contexts/ModalContext';
import roleService from '../../../firebase/roles';
import officeService from '../../../firebase/office';
import departmentService from '../../../firebase/departments';
import { toast } from 'react-hot-toast';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Trash2,
  Building,
  PlusCircle,
  PenSquareIcon,
  Edit,
} from 'lucide-react';

function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [offices, setOffices] = useState([]);
  const [allDepartments, setallDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);

  const { showModal } = useModal();
  const {
    formMethods,
    isRoleFormOpen,
    editingRole,
    isSubmitting,
    openRoleForm,
    closeRoleForm,
    handleFormSubmit,
  } = useRoleForm();

  const formProps = {
    formMethods,
    isRoleFormOpen,
    editingRole,
    isSubmitting,
    handleFormSubmit,
    closeRoleForm,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, officesData, departmentsData] = await Promise.all([
        roleService.getAllRoles(),
        officeService.getAllOffices(),
        departmentService.getAllDepartments(),
      ]);
      setRoles(rolesData);
      setOffices(officesData);
      setallDepartments(departmentsData);
      const initialExpanded = officesData.reduce((acc, office) => ({ ...acc, [office.id]: true }), {
        global: true,
      });
      setExpanded(initialExpanded);
    } catch (error) {
      toast.error('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const onRoleSuccess = (role) => {
    if (roles.some((r) => r.id === role.id)) {
      setRoles(roles.map((r) => (r.id === role.id ? role : r)));
    } else {
      setRoles((prev) => [role, ...prev]);
    }
    closeRoleForm();
  };

  const handleDelete = (role) => {
    showModal({
      title: `Delete Role: ${role.roleName}`,
      message: `Are you sure you want to delete this role? It has ${role.userCount} users assigned. This action is irreversible.`,
      confirmText: 'Delete',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          await roleService.deleteRole(role.id);
          setRoles(roles.filter((r) => r.id !== role.id));
        } catch (error) {
          toast.error('Failed to delete role.');
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedRoles.length === 0) return;
    showModal({
      title: `Delete ${selectedRoles.length} Roles`,
      message: 'Are you sure you want to delete the selected roles? This action is irreversible.',
      confirmText: 'Delete All',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          await roleService.bulkDeleteRoles(selectedRoles);
          setRoles(roles.filter((r) => !selectedRoles.includes(r.id)));
          setSelectedRoles([]);
        } catch (error) {
          toast.error('Failed to delete roles.');
        }
      },
    });
  };

  const handleClone = (role) => {
    const targetOffice = offices.find((o) => o.id !== role.officeId);
    if (!targetOffice) {
      toast.error('No other office available to clone to.');
      return;
    }
    showModal({
      title: `Clone Role: ${role.roleName}`,
      message: `Clone this role to ${targetOffice.officeName}?`,
      confirmText: 'Clone',
      onConfirm: async () => {
        try {
          const newRole = await roleService.cloneRole(role, targetOffice.id, role.departmentId);
          setRoles([...roles, newRole]);
        } catch (error) {
          toast.error('Failed to clone role.');
        }
      },
    });
  };

  const toggleExpansion = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAll = (roleIds) => {
    const allSelected = roleIds.every((id) => selectedRoles.includes(id));
    if (allSelected) {
      setSelectedRoles((prev) => prev.filter((id) => !roleIds.includes(id)));
    } else {
      setSelectedRoles((prev) => [...new Set([...prev, ...roleIds])]);
    }
  };

  const structuredRoles = useMemo(() => {
    const activeRoles = roles.filter((r) => r.status === 'active');
    const globalRolesByDept = allDepartments
      .map((dept) => ({
        ...dept,
        roles: activeRoles.filter((role) => role.isGlobal && role.departmentId === dept.id),
      }))
      .filter((dept) => dept.roles.length > 0);

    const officeStructure = offices
      .map((office) => {
        const officeDepts = allDepartments
          .map((dept) => {
            if (dept.officeId && dept.officeId !== office.officeId) {
              return null;
            }
            const deptRoles = activeRoles.filter(
              (role) =>
                !role.isGlobal &&
                role.officeId === office.officeId &&
                role.departmentId === dept.departmentId
            );
            return { ...dept, roles: deptRoles };
          })
          .filter((dept) => dept && dept.roles.length > 0);

        return { ...office, departments: officeDepts };
      })
      .filter((office) => office.departments.length > 0);

    return { globalRoles: globalRolesByDept, officeRoles: officeStructure };
  }, [roles, offices, allDepartments]);

  if (loading) return <Loading isOpen={true} />;

  const renderRoleRow = (role) => (
    <tr key={role.id} className="hover:bg-gray-50">
      <td className="pl-12 pr-4 py-3 w-10">
        <Checkbox
          id={`select-${role.id}`}
          checked={selectedRoles.includes(role.id)}
          onChange={() => handleSelectRole(role.id)}
        />
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800">{role.roleName}</div>
        <div className="text-xs text-gray-500">Level {role.level}</div>
      </td>
      <td className="px-4 py-3">
        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {Object.keys(role.permissions).length} permissions
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {role.userCount} users
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Button
            size="small"
            variant="ghost"
            className="text-blue-600 hover:text-blue-900"
            onClick={() => openRoleForm(role, { onSuccess: onRoleSuccess })}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="small"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => handleClone(role)}
          >
            <Copy size={16} />
          </Button>
          <Button
            size="small"
            variant="ghost"
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDelete(role)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );

  const renderDepartmentSection = (dept, parentId) => (
    <div key={`${parentId}-${dept.id}`} className="">
      <div
        className="flex justify-between items-center px-6 py-3 cursor-pointer hover:bg-neutral-50"
        onClick={() => toggleExpansion(`${parentId}-${dept.id}`)}
      >
        <div className="flex items-center">
          {expanded[`${parentId}-${dept.id}`] ? (
            <ChevronDown size={18} className="mr-2" />
          ) : (
            <ChevronRight size={18} className="mr-2" />
          )}
          <h3 className="text-md font-semibold text-gray-600">
            📁 {dept.departmentName} ({dept.roles.length} roles)
          </h3>
        </div>
      </div>
      {expanded[`${parentId}-${dept.id}`] && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-12 pr-4 py-3 w-10">
                <Checkbox
                  id={`select-all-${parentId}-${dept.id}`}
                  checked={
                    dept.roles.length > 0 && dept.roles.every((r) => selectedRoles.includes(r.id))
                  }
                  onChange={() => handleSelectAll(dept.roles.map((r) => r.id))}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions Assigned
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dept.roles.length > 0 ? (
              dept.roles.map(renderRoleRow)
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No roles in this department.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="w-full flex flex-col md:flex-row justify-between mb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Role Management</h2>
          <p className="text-gray-600">Manage user roles across all offices and departments.</p>
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          {selectedRoles.length > 0 && (
            <Button
              variant="ghost"
              className="border border-red-500 text-red-500 rounded-3xl"
              onClick={handleBulkDelete}
            >
              <Trash2 size={20} className="mr-2" />
              Delete Selected ({selectedRoles.length})
            </Button>
          )}
          <Button
            variant="primary"
            className="!rounded-3xl !w-fit"
            onClick={() => openRoleForm(null, { onSuccess: onRoleSuccess })}
          >
            <PlusCircle size={20} className="mr-2" />
            Add Role
          </Button>
        </div>
      </div>
      {/* Global Roles */}
      <CollapsibleSection
        id={'global'}
        title={`Global Roles`}
        isOpen={expanded['global']}
        onToggle={() => toggleExpansion('global')}
        titleClassName="space-x-3"
        badge={'🌐'}
        disabled={false}
      >
        {structuredRoles.globalRoles.length > 0 ? (
          structuredRoles.globalRoles.map((dept) => renderDepartmentSection(dept, 'global'))
        ) : (
          <p className="text-center py-4 text-gray-500">No global roles found.</p>
        )}
      </CollapsibleSection>

      {/* Office-specific Roles */}

      {structuredRoles.officeRoles.map((office) => (
        <CollapsibleSection
          id={office.id}
          title={`${office.officeName} (${office.departments.reduce((acc, d) => acc + d.roles.length, 0)} roles)`}
          isOpen={expanded[office.id]}
          onToggle={() => toggleExpansion(office.id)}
          contentClassName="p-0"
          badge={<Building size={20} className="inline-block text-gray-600" />}
          disabled={false}
        >
          {office.departments.length > 0 ? (
            office.departments.map((dept) => renderDepartmentSection(dept, office.id))
          ) : (
            <p className="text-center py-4 text-gray-500">No roles in this office.</p>
          )}
        </CollapsibleSection>
      ))}

      {/* Role Form Modal */}
      <RolePermissionsModal
        formProps={formProps}
        offices={offices}
        allDepartments={allDepartments}
        allRoles={roles}
      />
    </div>
  );
}

export default RoleManager;
