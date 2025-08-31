import { db } from '../config/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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
      throw error;
    }
  }

  // Updates a specific user's document in Firestore
  async updateUser(userId, data) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, data);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
