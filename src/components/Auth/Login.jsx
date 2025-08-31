import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {useForm} from 'react-hook-form'

import { Button, Input } from '../index';
import { login as storeLogin } from '../../features/user/userSlice';
import authService from '../../firebase/auth';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');

  const handleLogin = async (data) => {
    setError('');
    try {
        const userData = await authService.login(data);
        if (userData) {
            dispatch(storeLogin(userData));
        }
    } catch (err) {
        setError(err.message);
        console.error("Login Error:", err);
    }
};

 const handleGoogleLogin = async () => {
    setError('');
    try {
        const userData = await authService.loginWithGoogle();
        if (userData) {
            dispatch(storeLogin(userData));
        }
    } catch (err) {
        setError(err.message);
        console.error("Google Login Error:", err);
    }
}
  return (
    <div className="flex-grow flex items-center justify-center h-full bg-gray-50">
        <div className="w-19/20 max-w-md p-4 sm:p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">MANTRA-CMS <br />Login</h2>
        
            {error && <p className="text-sm text-center text-red-500">{error}</p>}
        
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
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
                    label="Password: "
                    type="password"
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

            <Button type="submit" className="hover:bg-blue-700">
                Sign In
            </Button>
            </form>

            {/* Separator */}
            <div className="flex items-center justify-center">
            <div className="w-full border-t border-gray-300"></div>
            <span className="px-2 text-sm text-gray-500 bg-white">OR</span>
            <div className="w-full border-t border-gray-300"></div>
            </div>

            {/* Google Sign-In Button */}
            <Button 
            onClick={handleGoogleLogin} 
            bgColor="bg-white" 
            textColor="text-gray-700" 
            className="border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
            >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign in with Google
            </Button>

            <p className="text-sm text-center text-gray-600">
            Don&apos;t have any account?&nbsp;
            <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
                Sign Up
            </Link>
            </p>
        </div>
    </div>
  )
}

export default Login