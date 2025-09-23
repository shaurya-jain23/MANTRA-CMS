
export const convertTimestamps = (docData) => {
  if (!docData) {
    return null;
  }
  const data = { ...docData };
  for (const key in data) {
    if (data[key] && typeof data[key].seconds === 'number') {
      // then to a universal ISO string format (e.g., "2025-09-08T12:30:00.000Z").
      data[key] = new Date(data[key].seconds * 1000).toISOString();
    }
  }
  return data;
};


export const getDefaultRouteForRole =  function (role) {
  switch (role) {
    case "sales":
      return "/sales";
    case "admin":
    case "superuser":
      return "/dashboard";
    case "manager":
      return "/manager";
    case "dispatch":
      return "/dispatch";
    case "accounts":
      return "/accounts";
    default:
      return "/unauthorized";
  }
}




export const checkNetworkConnection = () => {
  return navigator.onLine;
};

export const getErrorMessage = (error) => {
  if (!checkNetworkConnection()) {
    return {
      message: 'Please check your internet connection and try again.',
      code: 'network/offline'
    };
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      // Don't specify whether email or password is wrong for security
      return { 
        message: 'Invalid email or password. Please try again.', 
        code: error.code 
      };
    case 'auth/user-disabled':
      return { message: 'This account has been disabled. Please contact support.', code: error.code };
    case 'auth/user-mismatch':
      return { message: 'Invalid user authentication. Please login with correct credentials.', code: error.code };
    case 'auth/email-already-in-use':
      return { message: 'An account with this email already exists.', code: error.code };
    case 'auth/weak-password':
      return { message: 'Password is too weak. Please use at least 6 characters.', code: error.code };
    case 'auth/network-request-failed':
      return { message: 'Network error. Please check your internet connection.', code: error.code };
    case 'auth/too-many-requests':
      return { message: 'Too many unsuccessful attempts. Please try again later or reset your password.', code: error.code };
    case 'auth/popup-closed-by-user':
      return { message: 'Sign-in was cancelled.', code: error.code };
    case 'auth/popup-blocked':
      return { message: 'Popup was blocked. Please allow popups for this site.', code: error.code };
    case 'auth/operation-not-allowed':
      return { message: 'Email/password sign-in is not enabled. Please contact support.', code: error.code };
    case 'auth/unauthorized-domain':
      return { message: 'This domain is not authorized for authentication.', code: error.code };
    case 'auth/invalid-verification-code':
      return { message: 'The verification code is invalid.', code: error.code };
    case 'auth/invalid-verification-id':
      return { message: 'The verification ID is invalid.', code: error.code };
    default:
      // For any unhandled errors, provide a generic message
      console.error('Unhandled auth error:', error.code, error.message);
      return { 
        message: 'Authentication failed. Please try again.', 
        code: error.code || 'unknown' 
      };
  }
};

import toast from 'react-hot-toast';
import { Info } from 'lucide-react';

export const customInfoToast = (message, removeDelay) => {
  toast.custom(
    (t) => (
      <div 
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-custom-style`}
      >
        <Info style={{ color: '#FFD700' }} />
        <span>{message}</span>
      </div>
    ), 
    {
      id: 'reauth-toast',
      duration: '3000',
      removeDelay: '4000',
    }
  );
};