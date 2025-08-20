import app from "../config/firebase.js";
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

export class AuthService{
    auth;

    constructor(){
        this.auth = getAuth(app);
    }
    async createAccount({email, password, name}){
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password, name);
            if(userCredential.user){
                //call another method
                await updateProfile(userCredential.user, { displayName: name });
                return this.login({ email, password });
            }
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }
    async login({ email, password }) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            throw error;
        }
    }
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            return await signInWithPopup(this.auth, provider);
        } catch (error) {
            throw error;
        }
    }
    async getCurrentUser() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, (user) => {
                resolve(user || null);
                });
        });
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