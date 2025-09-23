import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Key, Eye, EyeOff, Shield } from 'lucide-react';
import { Input, Button, ModalContainer, ReAuthModal } from '../index';
import { toast } from 'react-hot-toast';
import authService from '../../firebase/auth';

function ChangePasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setError('');
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match')
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(
        data.currentPassword, 
        data.newPassword
      );
      reset();
      onClose();
    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else {
            setError(error.message || 'Password change failed. Please try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const pwdStrength = passwordStrength(newPassword);

  return (
    <>
      <ModalContainer isOpen={isOpen} className="max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          <p className="text-gray-600 mt-2 text-sm">Create a new strong password for your account</p>
        </div>
        {/* Error Display */}
        {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-sm text-center text-red-600">{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              placeholder="Enter current password"
              {...register('currentPassword', { 
                required: 'Current password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Input
              label="New Password"
              type="password"
              icon={Shield}
              placeholder="Enter new password"
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Password strength:</span>
                  <span className={`font-medium ${
                    pwdStrength.strength < 2 ? 'text-red-600' :
                    pwdStrength.strength < 3 ? 'text-orange-600' :
                    pwdStrength.strength < 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {pwdStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${pwdStrength.color}`}
                    style={{ width: `${(pwdStrength.strength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type= "password"
              icon={Shield}
              placeholder="Confirm new password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === newPassword || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
             <Button 
              type="button" 
              variant="secondary" 
              className='w-full'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
           
          </div>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className={`flex items-center ${newPassword?.length >= 6 ? 'text-green-600' : ''}`}>
              • At least 6 characters long
            </li>
            <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
              • One uppercase letter
            </li>
            <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
              • One number
            </li>
            <li className={`flex items-center ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
              • One special character
            </li>
          </ul>
        </div>
      </ModalContainer>
    </>
  );
}

export default ChangePasswordModal;