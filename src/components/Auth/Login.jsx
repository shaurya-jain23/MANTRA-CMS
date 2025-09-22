import React, { useState } from 'react'
import {Link, useNavigate, useLocation} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {useForm} from 'react-hook-form'
import {getDefaultRouteForRole} from '../../assets/helperFunctions'
import { Button, Input } from '../index';
import { login as storeLogin } from '../../features/user/userSlice';
import authService from '../../firebase/auth';
import { ArrowRight, FileText, Lock, Mail } from 'lucide-react'

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)

  const handleLogin = async (data) => {
    setError('');
    setLoading(true);
    try {
        const userData = await authService.login(data);
        if (userData) {
            dispatch(storeLogin(userData));
            const from = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
            navigate(from, { replace: true });
        }
    } catch (err) {
        if (err.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else {
            setError(err.message || 'Login failed. Please try again.');
        }
        console.error("Login Error:", err);
    } finally {
        setLoading(false);
    }
};

 const handleGoogleLogin = async () => {
    setError('');
    setLoading(true)
    try {
        const userData = await authService.loginWithGoogle();
        if (userData) {
            dispatch(storeLogin(userData));
            const from = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
            navigate(from, { replace: true });
        }
    } catch (err) {
        if (err.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else if (err.code === 'auth/popup-closed-by-user') {
            setError('Google sign-in was cancelled.');
        } else {
            setError(err.message || 'Google sign-in failed. Please try again.');
        }
        console.error("Google Login Error:", err);
    } finally {
        setLoading(false);
    }
}
  return (
    <div className="w-19/20 max-w-md p-4 sm:p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <FileText className='w-6 h-6 text-white '/>
            </div>
            <h1 className="text-xl sm:text-2xl font-semi-bold text-gary-900">Login to Your Account</h1>
            <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 mb-2">MANTRA-CMS</h2>
            <p className="text-gray-600 text-sm">Welcome back to Mantra Container Management System</p>
        </div>
        {/* Error Display */}
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-center text-red-600">{error}</p>
            </div>
        )}
        <div className="space-y-4">
             <form onSubmit={handleSubmit(handleLogin)} className="space-y-2">
                <Input
                    label="Email: "
                    placeholder="Enter your email"
                    type="email"
                    icon={Mail}
                    {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                    }
                    })}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                
                <Input
                    label="Password: "
                    type="password" 
                    icon= {Lock}
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

                <Button type="submit" variant='primary' className="!mt-6 group text-md" disabled={loading || isSubmitting}>
                    {loading ? (
                        'Signing In...'
                    ) : (
                        <>
                            Sign In <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                        </>
                    )}
                </Button>
            </form>
        </div>
       

        {/* Separator */}
        <div className="flex items-center justify-center">
        <div className="w-full border-t border-gray-300"></div>
        <span className="px-2 text-sm text-gray-500 bg-white">OR</span>
        <div className="w-full border-t border-gray-300"></div>
        </div>

        <Button 
        onClick={handleGoogleLogin} 
        variant='secondary'
        className="!w-full"
        disabled={loading || isSubmitting}
        >
        {loading ? (
                'Connecting...'
            ) : (
                <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign in with Google
                </>
            )}
        </Button>

        <p className="text-sm text-center text-gray-600">
        Don&apos;t have any account?&nbsp;
        <Link to="/signup" className="font-medium text-blue-800 hover:underline">
            Sign Up
        </Link>
        </p>
    </div>
  )
}

export default Login