import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUser,
  selectIsLoggedIn,
  updateUserData,
  setUserStatus,
  updatePermissions,
  updateCustomClaims,
  setTokenRefreshing,
} from '../features/user/userSlice';
import { convertTimestamps } from '../assets/helperFunctions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import authService from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export const useUserStatusMonitor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    
    // Set up real-time listener for user document
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = convertTimestamps(docSnapshot.data());

          console.log('Real-time user update received:', userData);

          // Check if role changed
          const roleChanged = user.role !== userData.role;
          const officeChanged = user.officeId !== userData.officeId;
          const departmentChanged = user.department !== userData.department;
          
          // Check if claims signal was updated (indicates Cloud Function completed)
          const claimsSignalUpdated = userData.claimsUpdatedAt && 
            (!user.claimsUpdatedAt || 
            new Date(userData.claimsUpdatedAt).getTime() !== new Date(user.claimsUpdatedAt).getTime());
          
          // Update Redux store with latest user data
          dispatch(updateUserData(userData));
          
          // If user status changed to active and claims signal received
          if (userData.status === 'active' && user.status === 'pending' && claimsSignalUpdated) {
            try {
              // Set refreshing state
              dispatch(setTokenRefreshing(true));
              
              console.log('Claims signal received, refreshing token...');
              
              // Cloud Function has set claims, now refresh token to get them
              const tokenData = await authService.refreshToken(true);
              
              if (tokenData?.customClaims?.role) {
                console.log('Custom claims retrieved:', tokenData.customClaims);
                dispatch(updateCustomClaims(tokenData.customClaims));
              } else {
                console.error('No custom claims found after signal');
                toast.error('Role assignment failed. Please contact admin.');
                dispatch(setTokenRefreshing(false));
                return;
              }
              
              // Now fetch permissions based on the role in custom claims
              const permissionsData = await authService.refreshPermissions(user.uid);
              
              if (permissionsData) {
                dispatch(updatePermissions(permissionsData.permissions));
                
                // Update other role-related data
                dispatch(updateUserData({
                  roleLevel: permissionsData.roleLevel,
                  roleName: permissionsData.roleName,
                  isGlobal: permissionsData.isGlobal,
                }));
              }
              
              console.log('Token and permissions refreshed after user approval');
              toast.success('Your account has been approved! Redirecting...');
              
              // Redirect to appropriate page based on role
              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
              
            } catch (error) {
              console.error('Error refreshing token/permissions:', error);
              toast.error('Please log in again to complete activation');
            } finally {
              // Clear refreshing state
              dispatch(setTokenRefreshing(false));
            }
          }
          
          // If role, office, or department changed and claims signal received
          if (userData.status === 'active' && 
              (roleChanged || officeChanged || departmentChanged) && 
              claimsSignalUpdated) {
            try {
              console.log('Role/office/department changed with claims signal, refreshing...');
              
              // Set refreshing state
              dispatch(setTokenRefreshing(true));
              
              // Cloud Function has updated claims, refresh token
              const tokenData = await authService.refreshToken(true);
              
              if (tokenData?.customClaims) {
                console.log('Updated custom claims retrieved:', tokenData.customClaims);
                dispatch(updateCustomClaims(tokenData.customClaims));
              }
              
              // Refresh permissions
              const permissionsData = await authService.refreshPermissions(user.uid);
              
              if (permissionsData) {
                dispatch(updatePermissions(permissionsData.permissions));
                dispatch(updateUserData({
                  roleLevel: permissionsData.roleLevel,
                  roleName: permissionsData.roleName,
                  isGlobal: permissionsData.isGlobal,
                }));
              }
              
              if (roleChanged) {
                toast.success('Your role has been updated');
              }
            } catch (error) {
              console.error('Error updating role/permissions:', error);
            } finally {
              // Clear refreshing state
              dispatch(setTokenRefreshing(false));
            }
          }
          
          // Check if status changed from active to disabled, redirect
          if (userData.status === 'disabled' && user.status === 'active') {
            toast.error('Your account has been disabled.');
            setTimeout(() => {
              navigate('/disabled');
            }, 1500);
          }
        } else {
          console.log('User document no longer exists');
        }
      },
      (error) => {
        console.error('Error listening to user updates:', error);
      }
    );

    return () => unsubscribe();
  }, [isLoggedIn, user?.uid, user?.status, user?.role, user?.officeId, user?.departmentId, dispatch, navigate]);
};
