import { db } from '../config/firebase.js';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { convertTimestamps, convertStringsToTimestamps } from '../assets/helperFunctions';

class DealerService {
  async addDealer(dealerData, user) {
    try {
      const docRef = await addDoc(collection(db, 'dealers'), {
        ...dealerData,
        registered_by_id: user.uid,
        registered_by_name: user.displayName,
        status: 'Active',
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...dealerData };
    } catch (error) {
      console.error('Error adding dealer:', error);
      toast.error(`Failed to add new dealer`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not add new dealer.');
    } finally {
      toast.success(`New dealer registered successfully`);
    }
  }

  async updateDealer(dealerId, dealerData) {
    try {
      const dealerRef = doc(db, 'dealers', dealerId);
      const dataToUpdate = convertStringsToTimestamps(dealerData);
      await updateDoc(dealerRef, dataToUpdate);
    } catch (error) {
      console.error('Error updating dealer:', error);
      toast.error(`Failed to update #${dealerId} dealer`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not update dealer.');
    } finally {
      toast.success(`Dealer #${dealerId} updated successfully`);
    }
  }

  async getDealers(userId, role) {
    const isAdminUser = role === 'superuser' || role === 'admin';
    const q = isAdminUser
      ? query(collection(db, 'dealers'))
      : query(collection(db, 'dealers'), where('registered_by_id', '==', userId));
    try {
      const querySnapshot = await getDocs(q);
      const dealers = [];
      querySnapshot.forEach((doc) => {
        dealers.push({ id: doc.id, ...convertTimestamps(doc.data()) });
      });
      return dealers;
    } catch (error) {
      console.error('Error fetching all dealers:', error);
      toast.error(`Failed to load dealers data`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not fetch dealers.');
    }
  }
  async deleteDealer(dealerId) {
    try {
      const docRef = doc(db, 'dealers', dealerId);
      await deleteDoc(docRef);
      toast.success(`Dealer # deleted successfully`);
    } catch (error) {
      console.error('Error deleting Dealer:', error);
      toast.error(`Failed to delete the dealer`);
      throw new Error('Failed to delete Dealer.');
    }
  }
  async getDealerById(dealerId) {
    try {
      const docRef = doc(db, 'dealers', dealerId);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    } catch (error) {
      console.error('Error fetching dealer:', error);
      throw new Error('Could not fetch dealers.');
    }
  }
}

const dealerService = new DealerService();
export default dealerService;
