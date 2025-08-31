import React, { useState, useEffect } from 'react';
import userService from '../firebase/user';

// Define the available roles and statuses
const ROLES = ['superuser', 'admin', 'manager' ,'sales', 'accounts', 'transporter', 'cha', 'store'];
const STATUSES = ['active', 'pending', 'disabled'];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await userService.getAllUsers();
        setUsers(userList);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFieldChange = async (userId, field, value) => {
    try {
      // Update the local state immediately for a responsive UI
      setUsers(users.map(user => 
        user.id === userId ? { ...user, [field]: value } : user
      ));
      // Update the user in Firestore
      await userService.updateUser(userId, { [field]: value });
    } catch (err) {
      setError('Failed to update user. Please try again.');
      // Optionally, revert the local state change on error
    }
  };

  if (loading) return <p className="p-8 text-center">Loading users...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.displayName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.status}
                    onChange={(e) => handleFieldChange(user.id, 'status', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
