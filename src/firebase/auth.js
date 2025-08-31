import app, { db } from "../config/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";



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
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userProfileData=  userSnap.data();
            if (userProfileData.created_at && typeof userProfileData.created_at.toDate === 'function') {
                userProfileData.created_at = userProfileData.created_at.toDate().toISOString();
            }
            if (userProfileData.updated_at && typeof userProfileData.updated_at.toDate === 'function') {
                userProfileData.updated_at = userProfileData.updated_at.toDate().toISOString();
            }
            return userProfileData;
        }
        return null;
    }
    async createAccount(userData){
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
                    role: userData.role || 'sales',
                    username: generateUsername(userData.fullname),
                    photoURL: userData.photoURL || null, 
                    status: 'pending', 
                    created_at: serverTimestamp(),
                    profileComplete: true, 
                }
                await setDoc(doc(db, "users", user.uid), userProfile);
                const loginData = {email: userData.email, password: userData.password};
                return this.login(loginData);
            }
            return userProfile;
        } catch (error) {
            throw error;
        }
    }
    async login({ email, password }) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            if (user) {
                const profile = await this.getUserProfile(userCredential.user.uid);
                const userData  = {email: user.email, uid: user.uid, displayName: user.displayName, ...profile}
                return userData; // Combine auth data with profile data
            }
        } catch (error) {
            throw error;
        }
    }
    async loginWithGoogle() {
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
            return profile;
            }
        } catch (error) {
            throw error;
        }
    }
    async getCurrentUser() {
        const result =  new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (!user) return resolve(null);
                const profile = await this.getUserProfile(user.uid);
                const userData  = {email: user.email, uid: user.uid, displayName: user.displayName, ...profile}
                resolve(userData || null);
            });
        });
        return result;
    }
    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.log("Firebase service :: logout :: error", error);
        }
    }
}

const authService = new AuthService();
export default authService;