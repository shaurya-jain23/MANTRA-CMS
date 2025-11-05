import React, { useState, useEffect } from 'react';
import userService from '../firebase/user';
import authService from '../firebase/auth';
import officeService from '../firebase/office';
import departmentService from '../firebase/departments';
import roleService from '../firebase/roles';
import { useModal } from '../contexts/ModalContext';
import { Button, SearchBar, Select, Container, Loading } from '../components';
import ApproveUserModal from '../components/Admin/ApproveUserModal';
import { ROLES, STATUSES } from '../assets/utils';
import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';

// Define the available roles and statuses with hierarchical permissions

function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]); // All departments
  const [allRoles, setAllRoles] = useState([]); // All roles
  const [filteredDepartments, setFilteredDepartments] = useState([]); // Departments filtered by office
  const [filteredRoles, setFilteredRoles] = useState([]); // Roles filtered by department
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);

  const { showModal } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  // Cascade filter: When office changes, filter departments
  useEffect(() => {
    if (officeFilter === 'all') {
      setFilteredDepartments(allDepartments);
      setDepartmentFilter('all');
      setRoleFilter('all');
    } else {
      const depts = allDepartments.filter(dept => dept.officeId === officeFilter);
      setFilteredDepartments(depts);
      setDepartmentFilter('all');
      setRoleFilter('all');
    }
  }, [officeFilter, allDepartments]);

  // Cascade filter: When department changes, filter roles
  useEffect(() => {
    if (departmentFilter === 'all') {
      setFilteredRoles(allRoles);
      setRoleFilter('all');
    } else {
      const rolesForDept = allRoles.filter(role => {
        if (role.isGlobal) return true; // Global roles available everywhere
        return role.departmentId === departmentFilter;
      });
      setFilteredRoles(rolesForDept);
      setRoleFilter('all');
    }
  }, [departmentFilter, allRoles]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, officeFilter, departmentFilter, statusFilter, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userList, officeList, departmentList, roleList] = await Promise.all([
        userService.getAllUsers(),
        officeService.getAllOffices(),
        departmentService.getAllDepartments(),
        roleService.getAllRoles(),
      ]);
      setUsers(userList);
      setOffices(officeList);
      setAllDepartments(departmentList);
      setFilteredDepartments(departmentList); // Initially show all departments
      setAllRoles(roleList);
      setFilteredRoles(roleList); // Initially show all roles
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOffice = officeFilter === 'all' || user.officeId === officeFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesOffice && matchesDepartment && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'role':
          const roleA = ROLES.find((r) => r.value === a.role)?.level || 0;
          const roleB = ROLES.find((r) => r.value === b.role)?.level || 0;
          return roleB - roleA;
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleFieldChange = async (userId, field, value) => {
    try {
      const updates = { [field]: value };
      
      // If changing office, reset department and role
      if (field === 'officeId') {
        updates.department = '';
        updates.role = '';
      }
      
      // If changing department, reset role
      if (field === 'department') {
        updates.role = '';
      }
      
      await userService.updateUser(userId, updates);
      setUsers(users.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
    } catch (err) {
      setError('Failed to update user. Please try again.');
      // Revert the local state change on error
      await fetchData();
    }
  };

  const handleDeleteUser = async (user) => {
    showModal({
      title: 'Delete User',
      message: `Are you sure you want to delete user ${user.displayName} (${user.email})? This action cannot be undone.`,
      confirmText: 'Delete User',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          await authService.deleteUserAccount(user.id);
          await fetchData();
        } catch (err) {
          setError('Failed to delete user.');
          console.error(err);
        }
      },
    });
  };

  const handleApproveUser = async (user) => {
    // Open the approve modal with role selection
    setUserToApprove(user);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async (roleId, officeId, departmentId) => {
    if (!userToApprove || !roleId || !officeId || !departmentId) return;
    
    try {
      // Update user status to active, assign office, department, and role
      await userService.updateUser(userToApprove.id, { 
        status: 'active',
        officeId: officeId,
        department: departmentId,
        role: roleId
      });
      
      // Close modal and refresh data
      setShowApproveModal(false);
      setUserToApprove(null);
      await fetchData();
      
      // Success message handled by userService
    } catch (err) {
      setError('Failed to approve user.');
      console.error(err);
    }
  };

  const handleCancelApprove = () => {
    setShowApproveModal(false);
    setUserToApprove(null);
  };

  // Get departments filtered by user's office
  const getDepartmentsForUser = (officeId) => {
    if (!officeId) return allDepartments;
    return allDepartments.filter(dept => dept.officeId === officeId);
  };

  // Get roles filtered by user's department and office
  const getRolesForUser = (departmentId, officeId) => {
    if (!departmentId) return allRoles;
    return allRoles.filter(role => {
      if (role.isGlobal) return true; // Global roles available everywhere
      if (role.departmentId === departmentId) return true;
      return false;
    });
  };

  const handleDisableUser = async (user) => {
    const action = user.status === 'disabled' ? 'enable' : 'disable';

    showModal({
      title: `${action === 'enable' ? 'Enable' : 'Disable'} User`,
      message: `Are you sure you want to ${action} ${user.displayName}?`,
      confirmText: `${action === 'enable' ? 'Enable' : 'Disable'} User`,
      confirmColor: action === 'enable' ? 'bg-green-600' : 'bg-orange-600',
      icon: (
        <XCircle
          className={`h-12 w-12 ${action === 'enable' ? 'text-green-600' : 'text-orange-600'}`}
        />
      ),
      onConfirm: async () => {
        try {
          const newStatus = action === 'enable' ? 'active' : 'disabled';
          await userService.updateUser(user.id, { status: newStatus });
          await fetchUsers();
        } catch (err) {
          setError(`Failed to ${action} user.`);
          console.error(err);
        }
      },
    });
  };

  const handleResetPassword = async (user) => {
    showModal({
      title: 'Reset Password',
      message: `Send password reset email to ${user.email}?`,
      confirmText: 'Send Reset Email',
      confirmColor: 'bg-blue-600',
      onConfirm: async () => {
        // This would integrate with out password reset service
        // For now, we'll just show a success message
        console.log('Password reset email would be sent to:', user.email);
      },
    });
  };

  // const getStatusColor = (status) => {
  //   const statusObj = STATUSES.find(s => s.value === status);
  //   return statusObj?.color || 'gray';
  // };

  // const getRoleLabel = (role) => {
  //   const roleObj = ROLES.find(r => r.value === role);
  //   return roleObj?.label || role;
  // };

  if (loading) return <Loading isOpen={true} message="Loading User Data..." />;

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white py-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <SearchBar
              query={searchTerm}
              setQuery={setSearchTerm}
              resultCount={filteredUsers.length}
              placeholder="Search by name, email, or username..."
              className="flex-grow"
              outerClasses='md:w-3/4 lg:w-1/2'
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <Select
                label="Filter by Office"
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                options={[
                  { value: 'all', name: 'All Offices' },
                  ...offices.map((office) => ({ value: office.officeId, name: office.officeName })),
                ]}
                outerClasses="min-w-[150px]"
              />
              
              <Select
                label="Filter by Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={[
                  { value: 'all', name: 'All Departments' },
                  ...filteredDepartments.map((dept) => ({ 
                    value: dept.departmentId, 
                    name: dept.departmentName 
                  })),
                ]}
                outerClasses="min-w-[150px]"
                disabled={officeFilter === 'all'}
              />
              
              <Select
                label="Filter by Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'all', name: 'All Roles' },
                  ...filteredRoles.map((role) => ({ 
                    value: role.roleId, 
                    name: role.roleName 
                  })),
                ]}
                outerClasses="min-w-[150px]"
                disabled={departmentFilter === 'all'}
              />

              <Select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', name: 'All Statuses' },
                  ...STATUSES.map((status) => ({ value: status.value, name: status.label })),
                ]}
                outerClasses="min-w-[150px]"
              />

              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'name', name: 'Name' },
                  { value: 'email', name: 'Email' },
                  { value: 'role', name: 'Role' },
                  { value: 'status', name: 'Status' },
                  { value: 'date', name: 'Registration Date' },
                ]}
                outerClasses="min-w-[150px]"
              />
            </div>
          </div>
        </div>
        {error && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Error Occured</h3>
            <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
          </div>
        )}
        {!error &&
          (filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Users found</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Your search or filter criteria did not match any of the users. <br /> Try adjusting
                search.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Office
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.displayName || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={user.officeId}
                              onChange={(e) =>
                                handleFieldChange(user.id, 'officeId', e.target.value)
                              }
                              options={offices.map((office) => ({
                                value: office.officeId,
                                name: office.officeName,
                              }))}
                              outerClasses="min-w-[120px]"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={user.department}
                              onChange={(e) =>
                                handleFieldChange(user.id, 'department', e.target.value)
                              }
                              options={getDepartmentsForUser(user.officeId).map((department) => ({
                                value: department.departmentId,
                                name: department.departmentName,
                              }))}
                              outerClasses="min-w-[120px]"
                              className="!w-fit"
                              disabled={!user.officeId}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={user.role}
                              placeholder="--Assign Role--"
                              defaultValue="--Assign Role--"
                              onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}
                              options={getRolesForUser(user.department, user.officeId).map((role) => ({
                                value: role.roleId,
                                name: role.roleName,
                              }))}
                              outerClasses="min-w-[120px]"
                              className="!w-fit"
                              disabled={!user.department}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={user.status}
                              onChange={(e) => handleFieldChange(user.id, 'status', e.target.value)}
                              options={STATUSES.map((status) => ({
                                value: status.value,
                                name: status.label,
                              }))}
                              outerClasses="min-w-[120px]"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created_at?.seconds
                              ? new Date(user.created_at.seconds * 1000).toLocaleDateString()
                              : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[300px]">
                            <div className="flex flex-wrap gap-2">
                              {user.status === 'pending' && (
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleApproveUser(user)}
                                  className="!w-fit !px-3 !text-xs"
                                >
                                  Approve
                                </Button>
                              )}

                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleResetPassword(user)}
                                className="!w-fit !px-3 !text-xs"
                              >
                                Reset PW
                              </Button>

                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleDisableUser(user)}
                                className={`!w-fit !px-3 !text-xs ${
                                  user.status === 'disabled'
                                    ? '!bg-green-100 !text-green-700 hover:!bg-green-200'
                                    : '!bg-orange-100 !text-orange-700 hover:!bg-orange-200'
                                }`}
                              >
                                {user.status === 'disabled' ? 'Enable' : 'Disable'}
                              </Button>

                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleDeleteUser(user)}
                                className="!w-fit !px-3 !text-xs !bg-red-100 !text-red-700 hover:!bg-red-200"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching your criteria.
                  </div>
                )}
              </div>
            </>
          ))}
        {/* Users Table */}
      </div>
      
      {/* Approve User Modal */}
      {showApproveModal && userToApprove && (
        <ApproveUserModal
          user={userToApprove}
          offices={offices}
          departments={allDepartments}
          roles={allRoles}
          onConfirm={handleConfirmApprove}
          onCancel={handleCancelApprove}
        />
      )}
    </Container>
  );
}

export default UsersPage;
