import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, login } from '../features/user/userSlice';
import userService from '../firebase/user';
import authService from '../firebase/auth';
import { Input, Button } from '../components';

function ProfilePage() {
  const userData = useSelector(selectUser);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      displayName: userData?.displayName || '',
      phone: userData?.phone || '',
      // Add other fields as needed
    },
  });

  const handleUpdateProfile = async (data) => {
    try {
      await userService.updateUserProfile(userData.uid, data);
      // Refresh user data in Redux store to reflect changes
      const updatedUserData = await authService.getUserProfile(userData.uid);
      dispatch(login(updatedUserData));
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
          <Input label="Email Address" value={userData?.email} disabled />
          <Input label="Full Name" {...register('displayName', { required: 'Full name is required' })} />
          {errors.displayName && <p className="text-red-500 text-sm">{errors.displayName.message}</p>}
          
          <Input label="Phone Number" type="tel" {...register('phone')} />

          <Button type="submit">Update Profile</Button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
