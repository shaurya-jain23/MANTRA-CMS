import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, login } from '../../features/user/userSlice';
import userService from '../../firebase/user'; 
import { Input, Button, Select } from '../index';

function UpdateProfile() {
  const userData = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      displayName: userData?.displayName || '',
      username: userData?.username || '',
      email: userData?.email || '',
      role: userData?.role || 'Select your role',
      phone: userData?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const profileData = {
        ...data,
        profileComplete: true, // Mark the profile as complete
      };
      await userService.updateUser(userData.uid, profileData);
      
      // Refresh user data in Redux and navigate to the dashboard
      const updatedUser = { ...userData, ...profileData };
      dispatch(login(updatedUser));
      navigate('/dashboard');

    } catch (error) {
      console.error("Profile completion error:", error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-50">
      <div className="w-19/20 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">MANTRA-CMS <br />Complete Your Profile</h2>
        <p className="text-center text-gray-600">Please provide a few more details to continue.</p>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register('displayName', { required: 'Full Name is required' })}
          />
          {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            disabled
            className="bg-gray-100 cursor-not-allowed"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Email address must be a valid address',
              }
            })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            {...register('phone', { required: 'Phone Number is required' })}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}

          <Select
            label="Role/Post"
            placeholder="Select your role"
            defaultValue="Select your role"
            options={['Manager', 'Sales', 'Accounts', 'Store', 'Transporter', 'Admin']}
            {...register('role', {
              required: 'Please select your role',
              validate: value => value !== 'Select your role' || 'Please select your role'
            })}            
          />
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}


          <Button type="submit" className="hover:bg-blue-700 !mt-6">Save and Continue</Button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
