import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsLoggedIn, updateUserData, setUserStatus } from '../features/user/userSlice';
import {convertTimestamps} from '../assets/helperFunctions'
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export const useUserStatusMonitor = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    // Set up real-time listener for user document
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = convertTimestamps(docSnapshot.data())

        console.log('Real-time user update received:', userData);
        // Update Redux store with latest user data
        dispatch(updateUserData(userData));
        // If status changed to active and we're on pending-approval page, redirect
        if (userData.status === 'active' && user.status === 'pending') {
          toast.success('Your account has been approved! Redirecting...')
        }
        // check if status changed from active to disabled, redirect
        if (userData.status === 'disabled' && user.status === 'active') {
          toast.error('Your account has been disabled.');
        }
      }  else {
        console.log('User document no longer exists');
      }
    }, (error) => {
      console.error('Error listening to user updates:', error);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user?.uid, dispatch, user?.status]);
};