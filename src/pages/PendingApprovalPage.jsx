import { useSelector } from 'react-redux';
import { selectUser } from '../features/user/userSlice';

const PendingApprovalPage = () => {
  const user = useSelector(selectUser);
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-3xl font-bold text-gray-800">Account Pending Approval</h1>
      <p className="mt-4 text-lg text-gray-600">
        Thank you for signing up, {user?.displayName || 'User'}.
      </p>
      <p className="mt-2 text-gray-500">
        Your account is currently awaiting approval from an administrator. Please check back later.
      </p>
    </div>
  );
};

export default PendingApprovalPage;
