import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, login } from '../features/user/userSlice';
import userService from '../firebase/user';
import authService from '../firebase/auth';
import { Input, Button, Container, ConfirmationAlert, LogoutBtn, ReAuthModal, ChangePasswordModal, Profile } from '../components';
import { SquarePen, Mail, Phone, UserRound, BookUser, Shield, LogOut, Trash2, Eye, EyeOff, Key, Calendar, BadgeCheck, AlertTriangle, ChevronLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDefaultRouteForRole } from "../assets/helperFunctions";
import { getRoleBadgeColor, PLACES } from "../assets/utils";

function ProfilePage() {
  const userData = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')

 
   const handleReAuthForDelete = async (authResult) => {
    setShowReAuthModal(false);
    setShowDeleteConfirm(true);
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const updatedData = {
        ...userData,
        ...data,
      };
      await userService.updateUser(userData.uid, updatedData);
      dispatch(login(updatedData));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);
    try {
      if(!showDeleteConfirm){
        await authService.deleteAccount(userData.uid);
      }
    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else {
            setError(err.message || 'Account deletion failed. Please try again.');
        }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:py-12 lg:px-15 shadow-md">
        {/* Header */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Button
              onClick={() => navigate(getDefaultRouteForRole(userData.role))}
              variant="secondary"
            >
              <ChevronLeft size={18} className="mr-2"/>
              Back
            </Button>
            <Button
              onClick={()=> setIsEditing(true)}
              variant="secondary"
              className="flex items-center"
            >
              <SquarePen size={18} className="mr-2"/> Edit Profile
            </Button>
            
          </div>
        </div>
        {/* Error Display */}
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3 w-fit flex items-center text-red-600 gap-2">
                <AlertCircle size={20}/> <p className="text-sm text-center ">{error}</p>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6 md:max-w-[50vw]">
            {/* Profile Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                {userData.photoURL ? (
                  <img 
                  src={userData?.photoURL} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                ) : (
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-white font-semibold text-4xl">
                      {userData.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className='grid grid-cols-3 gap-1'>
                  <h2 className="text-xl font-semibold text-gray-900 col-span-3 ">{userData?.displayName}</h2>
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-base ${getRoleBadgeColor(userData?.role)}`}>
                    {userData?.role?.toUpperCase()}
                  </span>
                  {userData?.profileComplete && (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-base bg-green-100 text-green-800">
                      <BadgeCheck size={12} className="mr-1" /> Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-base ${PLACES.find(p => p.value === userData?.workplace)?.color}`}>
                    {userData?.workplace?.toUpperCase()}
                  </span>
                </div>
              </div>
              <Profile
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loading={loading}  
                userData={userData}
                onSubmit={onSubmit}
                formatDate={formatDate}
              />
            </div>

            {/* Change Password Section */}
            <div className='w-full flex justify-center items-center'>
                <Button 
                onClick={() => setShowChangePassword(true)} 
                variant="secondary" 
                className="gap-2 !rounded-full"
              >
                <Key size={18} /> Change Password
              </Button>
              </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Account Status</h3>
              </div>
              <p className="text-green-700 text-sm">Your account is active and in good standing.</p>
            </div>

            {/* Quick Actions */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <LogoutBtn />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={()=> setShowReAuthModal(true)}
                >
                  <Trash2 size={16} /> Delete Account
                </Button>
              </div>
            </div>

            {/* System Information */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">System Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-xs">{userData?.uid?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{userData?.updated_at ? formatDate(userData.updated_at) : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Complete:</span>
                  <span>{userData?.profileComplete ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <ReAuthModal
        isOpen={showReAuthModal}
        onClose={() => setShowReAuthModal(false)}
        onSuccess={handleReAuthForDelete}
        actionType="delete"
      />
      <ConfirmationAlert
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Yes, Delete Account"
        confirmColor="bg-red-600"
        icon={<AlertTriangle className="h-12 w-12 text-red-500" />}
      />
    </Container>
  );
}

export default ProfilePage;

