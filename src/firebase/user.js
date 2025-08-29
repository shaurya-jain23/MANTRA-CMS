import { db } from '../config/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

class UserService {
  // Fetches all users from the 'users' collection
  async getAllUsers() {
    const usersCollectionRef = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollectionRef);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userList;
  }

  // Updates a specific user's document in Firestore
  async updateUser(userId, data) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, data);
  }
}

const userService = new UserService();
export default userService;
