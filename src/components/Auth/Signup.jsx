import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {getDefaultRouteForRole} from '../../assets/helperFunctions'
import {ArrowRight, FileText, Lock, Mail, Phone, UserRound} from 'lucide-react'
// Imports for our services, components, and state management
import authService from '../../firebase/auth'; 
import { login as storeLogin } from '../../features/user/userSlice';
import { Button, Input, Select } from '../index';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSignup = async (data) => {
    setError('');
    setLoading(true);
    try {
      const userData = await authService.createAccount(data);
      if (userData) {
        dispatch(storeLogin(userData));
        const from = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else {
            setError(err.message || 'Signup failed. Please try again.');
        }
      console.error("Signup Error:", err);
    } finally {
        setLoading(false);
    }
  };


  return (
      <div className="w-19/20 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <FileText className='w-6 h-6 text-white '/>
            </div>
            <h1 className="text-xl sm:text-2xl font-semi-bold text-gary-900">Create an Account</h1>
            <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 mb-2">MANTRA-CMS</h2>
            <p className="text-gray-600 text-sm">Join to Mantra Container Management System</p>
        </div>
        {/* Error Display */}
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-center text-red-600">{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit(handleSignup)} className="space-y-2">
          <Input
            label="Full Name"
            type="text"
            icon={UserRound}
            placeholder="Enter your full name"
            {...register('fullname', { required: 'Full Name is required' })}
          />
          {errors.fullname && <p className="text-sm text-red-500">{errors.fullname.message}</p>}

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="Enter your phone number"
            {...register('phone',  { required: 'Phone Number is required', pattern: {
            value: /^[0-9]{10}$/,
            message: 'Phone number must be 10 digits',
          }, })}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          
          <Input
            label="Email"
            type="email"
            icon={Mail}
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
            icon={Lock}
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

          <Button type="submit" variant='primary' className="!mt-6 group text-md" disabled={loading || isSubmitting}>
            {loading ? (
                        'Creatng Account...'
                    ) : (
                        <>
                            Create Account <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                        </>
                    )}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?&nbsp;
          <Link to="/" className="font-medium text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
  );
};

export default Signup;