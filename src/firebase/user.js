import toast from 'react-hot-toast';
import { db } from '../config/firebase.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, } from 'firebase/firestore';
import {convertStringsToTimestamps} from '../assets/helperFunctions'

class UserService {
  // Fetches all users from the 'users' collection
  async getAllUsers() {
    try {
      const usersCollectionRef = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollectionRef);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return userList;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error('Error occured while fetching users')
      toast.error(error)
      throw error;
    }
  }

  // Updates a specific user's document in Firestore
  async updateUser(userId, data) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const dataToUpdate = convertStringsToTimestamps(data);
      await updateDoc(userDocRef, {...dataToUpdate, updated_at: serverTimestamp()});
      toast.success('User updated successfully');
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error('Error occured while updating users')
      toast.error(error)
      throw error;
    }
  }
  async deleteUser(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Error oocured while deleting users')
      toast.error(error)
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
