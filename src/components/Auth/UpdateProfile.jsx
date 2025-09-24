import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, login } from '../../features/user/userSlice';
import userService from '../../firebase/user'; 
import { Input, Button, Select } from '../index';
import { ArrowRight, BookUser, FileText, Mail, Phone, UserRound } from 'lucide-react';

function UpdateProfile() {
  const userData = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      displayName: userData?.displayName || '',
      username: userData?.username || '',
      email: userData?.email || '',
      role: userData?.role || 'Select your role',
      phone: userData?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const profileData = {
        ...data,
        profileComplete: true,
      };
      await userService.updateUser(userData.uid, profileData);
      
      const updatedUser = { ...userData, ...profileData };
      dispatch(login(updatedUser));
      navigate('/dashboard');

    } catch (error) {
      console.error("Profile completion error:", error);
      setError('Failed to update profile. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-50">
      <div className="w-19/20 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
       {/* Header */}
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <FileText className='w-6 h-6 text-white '/>
            </div>
            <h1 className="text-xl sm:text-2xl font-semi-bold text-gary-900">Complete Your Profile</h1>
            <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 mb-2">MANTRA-CMS</h2>
            <p className="text-gray-600 text-sm">Please provide a few more details to continue.</p>
        </div>
         {/* Error Display */}
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-center text-red-600">{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={UserRound}
            placeholder="Enter your full name"
            {...register('displayName', { required: 'Full Name is required' })}
          />
          {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
          <Input
            label="Username"
            type="text"
            icon={BookUser}
            placeholder="Enter your username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            disabled
            icon={Mail}
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
            icon={Phone}
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

           <Button type="submit" variant='primary' className="!mt-6 group text-md" disabled={loading || isSubmitting}>
            {loading ? (
                        'Saving Details...'
                    ) : (
                        <>
                            Save and Continue<ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                        </>
                    )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
