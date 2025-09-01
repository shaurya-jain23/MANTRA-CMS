// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

// Imports for our services, components, and state management
import authService from '../../firebase/auth'; 
import { login as storeLogin } from '../../features/user/userSlice';
import { Button, Input, Select } from '../index';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');


  const handleSignup = async (data) => {
    setError('');
    try {
      console.log(data);
      
      const userData = await authService.createAccount(data);
      if (userData) {
        dispatch(storeLogin(userData));
        // navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      console.error("Signup Error:", err);
    }
  };


  return (
    <div className="flex flex-grow items-center justify-center bg-gray-50">
      <div className="w-19/20 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">MANTRA-CMS <br />Create an Account</h2>
        
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        
        <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register('fullname', { required: 'Full Name is required' })}
          />
          {errors.fullname && <p className="text-sm text-red-500">{errors.fullname.message}</p>}

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            {...register('phone', { required: 'Phone Number is required' })}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
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
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              }
            })}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

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

          <Button type="submit" className="hover:bg-blue-700 !mt-6">
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?&nbsp;
          <Link to="/" className="font-medium text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;