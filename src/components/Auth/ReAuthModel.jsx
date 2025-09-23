import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input, Button, ModalContainer } from '../index';
import { toast } from 'react-hot-toast';
import authService from '../../firebase/auth';

function ReAuthModal({ isOpen, onClose, onSuccess, actionType = "delete" }) {
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [error, setError] = useState('')

  const actionConfig = {
    delete: {
      title: "Confirm Your Identity",
      description: "For security reasons, please verify your identity to delete your account.",
      buttonText: "Confirm & Delete Account"
    },
    password: {
      title: "Verify Your Identity",
      description: "Please verify your identity before changing your password.",
      buttonText: "Continue to Change Password"
    },
    sensitive: {
      title: "Security Verification",
      description: "This action requires additional security verification.",
      buttonText: "Verify Identity"
    }
  };

  const config = actionConfig[actionType] || actionConfig.sensitive;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await authService.reauthenticate(data.currentPassword);
      setIsGoogleUser(result.isGoogleUser);
      
      if (result.isGoogleUser) {
        toast.success('Google authentication successful!');
        onSuccess(result);
        onClose();
      } else {
        toast.success('Authentication successful!');
        onSuccess(result);
        onClose();
      }
      reset();
    } catch (error) {
        if (error.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else {
            setError(error.message || 'Re-authentication failed. Please try again.');
        }
      console.error("Re-authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await authService.reauthenticate();
      setIsGoogleUser(true);
      onSuccess(result);
      onClose();
    } catch (error) {
        if (err.code === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection.');
        } else if (err.code === 'auth/popup-closed-by-user') {
            setError('Google sign-in was cancelled.');
        } else {
            setError(err.message || 'Google sign-in failed. Please try again.');
        }
        console.error("Google Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer isOpen={isOpen} className="max-w-md">
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-2 text-sm">{config.description}</p>
      </div>
        {/* Error Display */}
        {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-sm text-center text-red-600">{error}</p>
            </div>
        )}
      {!isGoogleUser ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            placeholder="Enter your current password"
            {...register('currentPassword', { 
              required: 'Current password is required' 
            })}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
          )}

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
              {loading ? 'Verifying...' : 'Verify Password'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-medium">Authentication Successful!</p>
          <p className="text-gray-600 text-sm mt-2">
            You can now proceed with the {actionType} action.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600 mb-3">Or authenticate with</p>
        <Button
          type="button"
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <img src="/icons/google-icon.svg" alt="Google" className="w-4 h-4" />
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-800 text-center">
          <strong>Note:</strong> Google users will be redirected to Google authentication.
        </p>
      </div>
    </ModalContainer>
  );
}

export default ReAuthModal;