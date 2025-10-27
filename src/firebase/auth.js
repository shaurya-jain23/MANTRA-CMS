import app, { db } from "../config/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  EmailAuthProvider, 
  reauthenticateWithCredential,
  reauthenticateWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {toast} from 'react-hot-toast';
import {convertTimestamps, convertStringsToTimestamps} from '../assets/helperFunctions';
import {getErrorMessage, checkNetworkConnection, customInfoToast} from '../assets/helperFunctions'
import userService from "./user.js";


const generateUsername = (name) => {
  if (!name) return '';
  const sanitizedName = name.replace(/\s+/g, '').toLowerCase();
  const randomNumber = Math.floor(10 + Math.random() * 90); // 2-digit number
  return `${sanitizedName}${randomNumber}`;
};

export class AuthService{
    auth;

    constructor(){
        this.auth = getAuth(app);
    }

    async getUserProfile(uid) {
        if (!checkNetworkConnection()) {
            throw new Error('Please check your internet connection.');
        }
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userProfileData = convertTimestamps(userSnap.data());
                return userProfileData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            const errorInfo = getErrorMessage(error);
            toast.error(`Failed to fetch user info`)
            toast.error(errorInfo.message)
            throw new Error(errorInfo.message);
        }
    }
    async createAccount(userData){
        if (!checkNetworkConnection()) {
            toast.error('Please check your internet connection.');
            throw new Error('Network connection required.');
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password, userData.fullname);
            const user = userCredential.user;
            if(user){
                await updateProfile(userCredential.user, { displayName: userData.fullname });
                const userProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: userData.fullname,
                    phone: userData.phone,
                    office_id: userData.office_id,
                    department: userData.department,
                    role: '',
                    username: generateUsername(userData.fullname),
                    photoURL: userData.photoURL || null, 
                    status: 'pending', 
                    created_at: serverTimestamp(),
                    profileComplete: true, 
                }
                await setDoc(doc(db, "users", user.uid), userProfile);
                const loginData = {email: userData.email, password: userData.password};
                toast.success(`Account created successfully`);
                return this.login(loginData);
            }
            return userProfile;
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            toast.error(`Failed to create your account`)
            toast.error(errorInfo.message);
            throw new Error(errorInfo.message);
            
        } 
    }
    async login({ email, password }) {
        if (!checkNetworkConnection()) {
            toast.error('Please check your internet connection.');
            throw new Error('Network connection required.');
        }
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            if (user) {
                const profile = await this.getUserProfile(userCredential.user.uid);
                const userData  = {email: user.email, uid: user.uid, displayName: user.displayName, ...profile}
                toast.success(`Login successful`)
                return userData; // Combine auth data with profile data
            }
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            toast.error(`Failed to login`)
            toast.error(errorInfo.message);
            throw new Error(errorInfo.message);
        } 
    }
    async loginWithGoogle() {
        if (!checkNetworkConnection()) {
            toast.error('Please check your internet connection.');
            throw new Error('Network connection required.');
        }
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);
            const user = result.user;
            if (user) {
            let profile = await this.getUserProfile(user.uid);
                if (!profile) {
                    profile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL || null, 
                        username: generateUsername(user.displayName),
                        status: 'pending',
                        created_at: serverTimestamp(),
                        profileComplete: false, 
                    }
                    await setDoc(doc(db, "users", user.uid), profile);
                }
                toast.success(`Logged in with Google Auth successfully`)
            return profile;
            }
        } catch (error) {
            const errorInfo = getErrorMessage(error);
             toast.error(`Google authentication failed`)
            toast.error(errorInfo.message);
            throw new Error(errorInfo.message);
        } 
    }
    async getCurrentUser() {
        if (!checkNetworkConnection()) {
            console.warn('Network offline: Cannot fetch current user');
            return null;
        }
        const result = new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (!user) return resolve(null);
                try {
                    const profile = await this.getUserProfile(user.uid);
                    const userData = {email: user.email, uid: user.uid, displayName: user.displayName, ...profile};
                    resolve(userData || null);
                } catch (error) {
                    console.error('Error getting current user profile:', error);
                    resolve(null);
                }
            });
        });
        return result;
    }
    async logout() {
        try {
            await signOut(this.auth);
            toast.success(`Logged out successfully`)
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            toast.error(`Failed to logout`)
            toast.error(errorInfo.message);
            console.log("Firebase service :: logout :: error", error);
        }
    }
    async changePassword(currentPassword, newPassword) {
        const toastId = toast.loading('Changing the password...');
        try {
            const {isGoogleUser} = await this.reauthenticate(currentPassword);
            if (isGoogleUser) {
                customInfoToast("Your password is managed by your Google Account. Please change it there.", '6000')
                return; 
            }
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            throw new Error(errorInfo.message);
        } finally{
            toast.dismiss(toastId);
        }
        try {
            await updatePassword(this.auth.currentUser, newPassword);
            toast.success('Password changed successfully!');
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            console.error("Password change error:", errorInfo.message);
            toast.error(errorInfo.message || 'Failed to change password. Please try again.');
            throw new Error(errorInfo.message);
        } finally {
            toast.dismiss(toastId);
        }
    }
    async deleteAccount(credential, uid) {
        const toastId = toast.loading('Deleting the Account...');
        try {
            if(credential){
                await this.reauthenticate(credential);
            }
            const userRef = doc(db, 'users', uid);
            await deleteDoc(userRef);
            await authService.deleteUser(this.auth.currentUser);
            toast.success('Account deleted successfully');
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            console.error("Account deletion error:", errorInfo.message);
            toast.error(errorInfo.message || 'Failed to delete account. Please try again.');
            throw new Error(errorInfo.message);
        } finally {
            toast.dismiss(toastId);
        }
    }
    
    // Add this method to the AuthService class in auth.js

    async deleteUserAccount(userId) {
    const toastId = toast.loading('Deleting user account...');
        try {
            if (!checkNetworkConnection()) {
                throw new Error('Please check your internet connection.');
            }
            // Get the current user to verify permissions (client-side check)
            const currentUser = this.auth.currentUser;
            if (!currentUser) {
            throw new Error('You must be logged in to perform this action.');
            }
            // Verify current user is a superuser (client-side check)
            const currentUserProfile = await this.getUserProfile(currentUser.uid);
            if (currentUserProfile?.role !== 'superuser') {
            throw new Error('Only superusers can delete user accounts.');
            }

            // The cloud function will automatically delete the Auth user
            await userService.deleteUser(userId);
            
            toast.success('User account deleted successfully');
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            console.error("Account deletion error:", errorInfo.message);
            toast.error(errorInfo.message || 'Failed to delete user account. Please try again.');
            throw new Error(errorInfo.message);
        } finally {
            toast.dismiss(toastId);
        }
    }

    async reauthenticate(currentPassword){
        const toastId = toast.loading('Reauthenticating...');
        try {
            const user = this.auth.currentUser;
            if (!user || !user.email) {
                throw new Error("No authenticated user found.");
            }
            const isGoogleUser = user.providerData.some(
                provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID
            );
            if (isGoogleUser) {
                customInfoToast("Please re-authenticate by signing in with Google again.", '2000')
                const provider = new GoogleAuthProvider();
                const result  = await reauthenticateWithPopup(user, provider);
                console.log(result);
                toast.success('Google re-authentication successful', { removeDelay: 3000 });
                return {...result.user, isGoogleUser}
            } else {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                const result = await reauthenticateWithCredential(user, credential);
                toast.success('re-authentication successful');
                return {...result.user, isGoogleUser}
            }
        } catch (error) {
            const errorInfo = getErrorMessage(error);
            console.error("Re-authentication error:", errorInfo.message);
            toast.error(errorInfo.message || 'Failed to authenticate account. Please try again.');
            throw new Error(errorInfo.message);
        } finally {
            toast.dismiss(toastId);
        }
    }
}

const authService = new AuthService();
export default authService;