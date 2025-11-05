import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {getDefaultRouteForRole} from '../../assets/helperFunctions'
import {ArrowRight, FileText, Lock, Mail, Phone, UserRound} from 'lucide-react'
// Imports for our services, components, and state management
import authService from '../../firebase/auth'; 
import officeService from '../../firebase/office'; 
import departmentService from '../../firebase/departments';
import { login as storeLogin } from '../../features/user/userSlice';
import { Button, Input, Select } from '../index';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const officesList = await officeService.getAllOffices();
        setOffices(officesList);
      } catch (error) {
        console.error('Error fetching offices:', error);
      }
    };
    fetchOffices();
  }, []);

  useEffect(()=> {
        const subscription = watch((value, {name})=> {
            if(name === 'officeId'){
              const fetchDepartments = async () => {
                try {
                  const departmentsForOffice = await departmentService.getDepartmentsByOffice(value.officeId);
                  setDepartments(departmentsForOffice);
                } catch (error) {
                  console.error('Error fetching departments:', error);
                }
              };
              fetchDepartments();
            }
        })
        return () =>{
            subscription.unsubscribe()
        }
    }, [watch, setDepartments])

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
            required
            placeholder="Enter your full name"
            {...register('fullname', { required: 'Full Name is required' })}
            error={errors.fullname?.message} 
          />
          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            required
            placeholder="Enter your phone number"
            {...register('phone',  { required: 'Phone Number is required', pattern: {
            value: /^[0-9]{10}$/,
            message: 'Phone number must be 10 digits',
          }, })}
          error={errors.phone?.message} 
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            required
            placeholder="Enter your email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Email address must be a valid address',
              }
            })}
            error={errors.email?.message} 
          />
          
          <Input
            label="Password"
            type="password"
            icon={Lock}
            required
            placeholder="Enter your password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              }
            })}
            error={errors.password?.message} 
          />
          <Controller
            name="officeId"
            control={control}
            rules={{
              required: 'Please select your office location',
              validate: (value) => value !== 'Choose your office location' || 'Please select your office location',
            }}
            render={({ field }) => (
              <Select
                label="Working Office"
                placeholder="Choose your office location"
                {...field}
                required
                defaultValue="Choose your office location"
                options={offices.map(office => ({
                  value: office.officeId,
                  name: office.officeName
                }))}
                error={errors.officeId?.message} 
              />
            )}
          />
          <Controller
            name="department"
            control={control}
            rules={{
              required: 'Please select your department',
              validate: value => value !== 'Select your department' || 'Please select your department'
            }}
            render={({ field }) => (
              <Select
                label="Department"
                defaultValue="Select your department"
                placeholder="Select your department"
                {...field}
                required
                options={departments.map(dept => ({
                  value: dept.departmentId,
                  name: dept.departmentName
                }))}
                disabled={departments.length === 0}
                error={errors.departments?.message} 
              />
            )}
          />
        
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
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
  );
};

export default Signup;