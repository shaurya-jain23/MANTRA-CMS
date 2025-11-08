import React, { useEffect, useMemo, useCallback, useReducer } from 'react';
import userService from '../firebase/user';
import authService from '../firebase/auth';
import officeService from '../firebase/office';
import departmentService from '../firebase/departments';
import roleService from '../firebase/roles';
import { useModal } from '../contexts/ModalContext';
import { Button, SearchBar, Select, Container, Loading, UserManagementModal } from '../components';
import { ROLES, STATUSES } from '../assets/utils';
import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';

// Reducer action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DATA: 'SET_DATA',
  SET_FILTERED_USERS: 'SET_FILTERED_USERS',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_FILTERS: 'SET_FILTERS',
  SET_OFFICE_FILTER: 'SET_OFFICE_FILTER',
  SET_DEPARTMENT_FILTER: 'SET_DEPARTMENT_FILTER',
  SET_ROLE_FILTER: 'SET_ROLE_FILTER',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_SORT_BY: 'SET_SORT_BY',
  SET_FILTERED_DEPARTMENTS: 'SET_FILTERED_DEPARTMENTS',
  SET_FILTERED_ROLES: 'SET_FILTERED_ROLES',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
};

// Initial state
const initialState = {
  loading: true,
  error: '',
  users: [],
  offices: [],
  allDepartments: [],
  allRoles: [],
  filteredDepartments: [],
  filteredRoles: [],
  filteredUsers: [],
  searchTerm: '',
  roleFilter: 'all',
  officeFilter: 'all',
  departmentFilter: 'all',
  statusFilter: 'all',
  sortBy: 'name',
  showManagementModal: false,
  userToManage: null,
  isApprovalMode: false,
};

// Reducer function
function usersReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTIONS.SET_DATA:
      return {
        ...state,
        users: action.payload.users,
        offices: action.payload.offices,
        allDepartments: action.payload.departments,
        allRoles: action.payload.roles,
        filteredDepartments: action.payload.departments,
        filteredRoles: action.payload.roles,
        loading: false,
      };
    
    case ACTIONS.SET_FILTERED_USERS:
      return { ...state, filteredUsers: action.payload };
    
    case ACTIONS.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    
    case ACTIONS.SET_OFFICE_FILTER:
      return {
        ...state,
        officeFilter: action.payload,
        departmentFilter: action.payload !== 'all' ? 'all' : state.departmentFilter,
        roleFilter: action.payload !== 'all' ? 'all' : state.roleFilter,
      };
    
    case ACTIONS.SET_DEPARTMENT_FILTER:
      return {
        ...state,
        departmentFilter: action.payload,
        roleFilter: action.payload !== 'all' ? 'all' : state.roleFilter,
      };
    
    case ACTIONS.SET_ROLE_FILTER:
      return { ...state, roleFilter: action.payload };
    
    case ACTIONS.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    
    case ACTIONS.SET_SORT_BY:
      return { ...state, sortBy: action.payload };
    
    case ACTIONS.SET_FILTERED_DEPARTMENTS:
      return { ...state, filteredDepartments: action.payload };
    
    case ACTIONS.SET_FILTERED_ROLES:
      return { ...state, filteredRoles: action.payload };
    
    case ACTIONS.OPEN_MODAL:
      return {
        ...state,
        showManagementModal: true,
        userToManage: action.payload.user,
        isApprovalMode: action.payload.isApprovalMode,
      };
    
    case ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        showManagementModal: false,
        userToManage: null,
        isApprovalMode: false,
      };
    
    default:
      return state;
  }
}

function UsersPage() {
  const [state, dispatch] = useReducer(usersReducer, initialState);
  const { showModal } = useModal();
  // Memoize filtered departments based on office filter
  const filteredDepartmentsList = useMemo(() => {
    if (state.officeFilter === 'all') {
      return state.allDepartments;
    }
    return state.allDepartments.filter(dept => dept.officeId === state.officeFilter);
  }, [state.officeFilter, state.allDepartments]);

  // Memoize filtered roles based on department filter
  const filteredRolesList = useMemo(() => {
    if (state.departmentFilter === 'all') {
      return state.allRoles;
    }
    return state.allRoles.filter(role => {
      if (role.isGlobal) return true;
      return role.departmentId === state.departmentFilter;
    });
  }, [state.departmentFilter, state.allRoles]);

  // Update filtered departments and roles when memoized lists change
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_FILTERED_DEPARTMENTS, payload: filteredDepartmentsList });
  }, [filteredDepartmentsList]);

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_FILTERED_ROLES, payload: filteredRolesList });
  }, [filteredRolesList]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort users when dependencies change
  useEffect(() => {
    filterAndSortUsers();
  }, [
    state.users,
    state.searchTerm,
    state.roleFilter,
    state.officeFilter,
    state.departmentFilter,
    state.statusFilter,
    state.sortBy,
  ]);

  // Memoize fetchData
  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const [userList, officeList, departmentList, roleList] = await Promise.all([
        userService.getAllUsers(),
        officeService.getAllOffices(),
        departmentService.getAllDepartments(),
        roleService.getAllRoles(),
      ]);
      dispatch({
        type: ACTIONS.SET_DATA,
        payload: {
          users: userList,
          offices: officeList,
          departments: departmentList,
          roles: roleList,
        },
      });
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to fetch users.' });
      console.error(err);
    }
  }, []);

  const filterAndSortUsers = useCallback(() => {
    let filtered = state.users.filter((user) => {
      const matchesSearch =
        user.displayName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(state.searchTerm.toLowerCase());

      const matchesOffice = state.officeFilter === 'all' || user.officeId === state.officeFilter;
      const matchesRole = state.roleFilter === 'all' || user.role === state.roleFilter;
      const matchesDepartment = state.departmentFilter === 'all' || user.department === state.departmentFilter;
      const matchesStatus = state.statusFilter === 'all' || user.status === state.statusFilter;

      return matchesSearch && matchesRole && matchesOffice && matchesDepartment && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (state.sortBy) {
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

    dispatch({ type: ACTIONS.SET_FILTERED_USERS, payload: filtered });
  }, [
    state.users,
    state.searchTerm,
    state.roleFilter,
    state.officeFilter,
    state.departmentFilter,
    state.statusFilter,
    state.sortBy,
  ]);

  // Wrap handlers in useCallback
  const handleEditUser = useCallback((user) => {
    dispatch({ 
      type: ACTIONS.OPEN_MODAL, 
      payload: { user, isApprovalMode: false } 
    });
  }, []);

  const handleApproveUser = useCallback((user) => {
    dispatch({ 
      type: ACTIONS.OPEN_MODAL, 
      payload: { user, isApprovalMode: true } 
    });
  }, []);

  const handleConfirmManagement = useCallback(async (roleId, officeId, departmentId) => {
    if (!state.userToManage || !roleId || !officeId || !departmentId) return;
    
    try {
      const updates = { 
        officeId: officeId,
        department: departmentId,
        role: roleId
      };

      if (state.isApprovalMode) {
        updates.status = 'active';
      }

      await userService.updateUser(state.userToManage.id, updates);
      
      dispatch({ type: ACTIONS.CLOSE_MODAL });
      await fetchData();
      
    } catch (err) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: `Failed to ${state.isApprovalMode ? 'approve' : 'update'} user.` 
      });
      console.error(err);
    }
  }, [state.userToManage, state.isApprovalMode, fetchData]);

  const handleCancelManagement = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_MODAL });
  }, []);

  const handleDeleteUser = useCallback(async (user) => {
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
          dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to delete user.' });
          console.error(err);
        }
      },
    });
  }, [showModal, fetchData]);

  const handleDisableUser = useCallback(async (user) => {
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
          await fetchData();
        } catch (err) {
          dispatch({ type: ACTIONS.SET_ERROR, payload: `Failed to ${action} user.` });
          console.error(err);
        }
      },
    });
  }, [showModal, fetchData]);

  const handleStatusChange = useCallback(async (userId, newStatus) => {
    try {
      await userService.updateUser(userId, { status: newStatus });
      await fetchData();
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to update user status.' });
      console.error(err);
    }
  }, [fetchData]);

  const handleResetPassword = useCallback(async (user) => {
    showModal({
      title: 'Reset Password',
      message: `Send password reset email to ${user.email}?`,
      confirmText: 'Send Reset Email',
      confirmColor: 'bg-blue-600',
      onConfirm: async () => {
        console.log('Password reset email would be sent to:', user.email);
      },
    });
  }, [showModal]);

  if (state.loading) return <Loading isOpen={true} message="Loading User Data..." />;

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
              query={state.searchTerm}
              setQuery={(value) => dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: value })}
              resultCount={state.filteredUsers.length}
              placeholder="Search by name, email, or username..."
              className="flex-grow"
              outerClasses='md:w-3/4 lg:w-1/2'
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <Select
                label="Filter by Office"
                value={state.officeFilter}
                onChange={(e) => dispatch({ type: ACTIONS.SET_OFFICE_FILTER, payload: e.target.value })}
                options={[
                  { value: 'all', name: 'All Offices' },
                  ...state.offices.map((office) => ({ value: office.officeId, name: office.officeName })),
                ]}
                outerClasses="min-w-[150px]"
              />
              
              <Select
                label="Filter by Department"
                value={state.departmentFilter}
                onChange={(e) => dispatch({ type: ACTIONS.SET_DEPARTMENT_FILTER, payload: e.target.value })}
                options={[
                  { value: 'all', name: 'All Departments' },
                  ...state.filteredDepartments.map((dept) => ({ 
                    value: dept.departmentId, 
                    name: dept.departmentName 
                  })),
                ]}
                outerClasses="min-w-[150px]"
                disabled={state.officeFilter === 'all'}
              />
              
              <Select
                label="Filter by Role"
                value={state.roleFilter}
                onChange={(e) => dispatch({ type: ACTIONS.SET_ROLE_FILTER, payload: e.target.value })}
                options={[
                  { value: 'all', name: 'All Roles' },
                  ...state.filteredRoles.map((role) => ({ 
                    value: role.roleId, 
                    name: role.roleName 
                  })),
                ]}
                outerClasses="min-w-[150px]"
                disabled={state.departmentFilter === 'all'}
              />

              <Select
                label="Filter by Status"
                value={state.statusFilter}
                onChange={(e) => dispatch({ type: ACTIONS.SET_STATUS_FILTER, payload: e.target.value })}
                options={[
                  { value: 'all', name: 'All Statuses' },
                  ...STATUSES.map((status) => ({ value: status.value, name: status.label })),
                ]}
                outerClasses="min-w-[150px]"
              />

              <Select
                label="Sort By"
                value={state.sortBy}
                onChange={(e) => dispatch({ type: ACTIONS.SET_SORT_BY, payload: e.target.value })}
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
        {state.error && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Error Occured</h3>
            <p className="text-red-500  mb-6 max-w-md">Error: {state.error}</p>
          </div>
        )}
        {!state.error &&
          (state.filteredUsers.length === 0 ? (
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
                      {state.filteredUsers.map((user) => (
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
                            <div className="text-sm text-gray-900">
                              {state.offices.find(o => o.officeId === user.officeId)?.officeName || 'Not assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {state.allDepartments.find(d => d.departmentId === user.department)?.departmentName || 'Not assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {state.allRoles.find(r => r.roleId === user.role)?.roleName || 'Not assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={user.status}
                              onChange={(e) => handleStatusChange(user.id, e.target.value)}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[350px]">
                            <div className="flex flex-wrap gap-2">
                              {user.status === 'pending' ? (
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleApproveUser(user)}
                                  className="!w-fit !px-3 !text-xs"
                                >
                                  Approve
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="small"
                                  onClick={() => handleEditUser(user)}
                                  className="!w-fit !px-3 !text-xs !bg-blue-100 !text-blue-700 hover:!bg-blue-200"
                                >
                                  Edit Details
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

                {state.filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching your criteria.
                  </div>
                )}
              </div>
            </>
          ))}
        {/* Users Table */}
      </div>
      
      {/* User Management Modal */}
      {state.showManagementModal && state.userToManage && (
        <UserManagementModal
          isOpen={state.showManagementModal}
          user={state.userToManage}
          offices={state.offices}
          departments={state.allDepartments}
          roles={state.allRoles}
          onConfirm={handleConfirmManagement}
          onCancel={handleCancelManagement}
          isApprovalMode={state.isApprovalMode}
        />
      )}
    </Container>
  );
}

export default UsersPage;
