import React, { useState, useEffect } from 'react';
import userService from '../firebase/user';
import authService from '../firebase/auth';
import { useModal } from '../contexts/ModalContext';
import { Button, SearchBar, Select, Container, Loading } from '../components';
import { ROLES, STATUSES, PLACES } from '../assets/utils';
import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';

// Define the available roles and statuses with hierarchical permissions


function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const { showModal } = useModal();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userList = await userService.getAllUsers();
      setUsers(userList);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'role':
          const roleA = ROLES.find(r => r.value === a.role)?.level || 0;
          const roleB = ROLES.find(r => r.value === b.role)?.level || 0;
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
      await userService.updateUser(userId, { [field]: value });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, [field]: value } : user
      ));
    } catch (err) {
      setError('Failed to update user. Please try again.');
      // Revert the local state change on error
      await fetchUsers();
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
          await fetchUsers();
        } catch (err) {
          setError('Failed to delete user.');
          console.error(err);
        }
      }
    });
  };

  const handleApproveUser = async (user) => {
    showModal({
      title: 'Approve User',
      message: `Are you sure you want to approve ${user.displayName}? They will gain access to the system.`,
      confirmText: 'Approve User',
      confirmColor: 'bg-green-600',
      icon: <CheckCircle className="h-12 w-12 text-green-500"/>,
      onConfirm: async () => {
        try {
          await userService.updateUser(user.id, { status: 'active' });
          await fetchUsers();
        } catch (err) {
          setError('Failed to approve user.');
          console.error(err);
        }
      }
    });
  };

  const handleDisableUser = async (user) => {
    const action = user.status === 'disabled' ? 'enable' : 'disable';
    
    showModal({
      title: `${action === 'enable' ? 'Enable' : 'Disable'} User`,
      message: `Are you sure you want to ${action} ${user.displayName}?`,
      confirmText: `${action === 'enable' ? 'Enable' : 'Disable'} User`,
      confirmColor: action === 'enable' ? 'bg-green-600' : 'bg-orange-600',
      icon: <XCircle className={`h-12 w-12 ${action === 'enable' ? 'text-green-600' : 'text-orange-600'}`}/>,
      onConfirm: async () => {
        try {
          const newStatus = action === 'enable' ? 'active' : 'disabled';
          await userService.updateUser(user.id, { status: newStatus });
          await fetchUsers();
        } catch (err) {
          setError(`Failed to ${action} user.`);
          console.error(err);
        }
      }
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
      }
    });
  };

  const getStatusColor = (status) => {
    const statusObj = STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  const getRoleLabel = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj?.label || role;
  };

  if (loading) return <Loading isOpen={true} message="Loading User Data..." />

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
            />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', name: 'All Roles' },
                ...ROLES.map(role => ({ value: role.value, name: role.label }))
              ]}
              outerClasses="min-w-[150px]"
            />
            
            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', name: 'All Statuses' },
                ...STATUSES.map(status => ({ value: status.value, name: status.label }))
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
                { value: 'date', name: 'Registration Date' }
              ]}
              outerClasses="min-w-[150px]"
            />
          </div>
        </div>
      </div>
      {error && 
        <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className='w-8 h-8 text-red-600'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>Error Occured</h3>
        <p className="text-red-500  mb-6 max-w-md">Error: {error}</p>
      </div>      
      }
      {!error && (filteredUsers.length === 0 ? <div className='flex flex-col items-center py-12 text-center'>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className='w-8 h-8 text-slate-400'/>
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>No Users found</h3>
        <p className="text-slate-500 mb-6 max-w-md">Your search or filter criteria did not match any of the users. <br /> Try adjusting search.</p>
      </div> : <>
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
                  Work Location
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
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={user.workplace}
                      onChange={(e) => handleFieldChange(user.id, 'workplace', e.target.value)}
                      options={PLACES.map(location => ({ value: location.value, name: location.label }))}
                      outerClasses="min-w-[120px]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={user.role}
                      onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}
                      options={ROLES.map(role => ({ value: role.value, name: role.label }))}
                      outerClasses="min-w-[120px]"
                      className='!w-fit'
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={user.status}
                      onChange={(e) => handleFieldChange(user.id, 'status', e.target.value)}
                      options={STATUSES.map(status => ({ value: status.value, name: status.label }))}
                      outerClasses="min-w-[120px]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at?.seconds ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : 'Unknown'}
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
      </>)}
      {/* Users Table */}
      
    </div>
    </Container>
  );
}

export default UsersPage;