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

import { doc, getDoc, setDoc } from "firebase/firestore";

export class AuthService{
    auth;

    constructor(){
        this.auth = getAuth(app);
    }

    async getUserProfile(uid) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    }
    async createAccount({email, password, name}){
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password, name);
            const user = userCredential.user;
            if(user){
                await updateProfile(userCredential.user, { displayName: name });
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: name,
                    role: 'sales', 
                    status: 'pending', 
                });
                return this.login({ email, password });
            }
            return user;
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
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        role: 'sales',
                        status: 'pending',
                    });
                    profile = await this.getUserProfile(user.uid);
                }
            const userData  = {email: user.email, uid: user.uid, displayName: user.displayName, ...profile}
            return userData;
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