import { db } from '../config/firebase.js';
import {
  doc,
  collection,
  addDoc,
  query,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {convertTimestamps} from '../assets/helperFunctions'
import {toast} from 'react-hot-toast';

class PIService {
  async getPINumber(piId = null) {
    try {
      if (piId) {
        const docSnap = await getDoc(doc(db, 'performa_invoices', String(piId)));
        return docSnap.data();
      }
      const querySnapshot = await getDocs(collection(db, 'performa_invoices'));
      let maxNum = 0;
      querySnapshot.forEach((doc) => {
        const inv = doc.data();
        const num = parseInt(inv.pi_number.split('-')[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const year = new Date().getFullYear();
      const nextYear = String(year + 1).slice(-2);
      const newCount = String(maxNum + 1).padStart(3, '0');
      const newPiNumber = `MEB-${newCount}/${year}-${nextYear}`;
      return newPiNumber;
    } catch (error) {
      console.error('Error generating PI number:', error);
      toast.error(`Error occured while generating PI number`);
      throw new Error('Could not generate a new PI number.');
    }
  }

  async getPIs(userId, role) {
    const isAdminUser = role === 'superuser' || role === 'admin';
    const q = isAdminUser
        ? query(collection(db, 'performa_invoices'))
        : query(collection(db, 'performa_invoices'), where('generated_by_id', '==', userId));
        
        
    try {
        const querySnapshot = await getDocs(q);
        const performa_invoices = [];
        querySnapshot.forEach((doc) => {
            performa_invoices.push({ id: doc.id, ...convertTimestamps(doc.data()) });
        });
        
        return performa_invoices;
    } catch (error) {
      console.error('Error fetching all Performa Invoices:', error);
      toast.error(`Failed to fetch all Proforma Invoices`)
      toast.error(`Error: ${error.message}`)
      throw new Error('Could not fetch Performa Invoices.');
    }
  }
  async addPI(piData) {
    try {
      const docRef = await addDoc(collection(db, 'performa_invoices'), {
        ...piData,
        createdAt: serverTimestamp(),
        status: 'unpaid', // Default status for new PIs
      });
      toast.success(`Perform Invoice #${piData.pi_number} generated successfully`)
      return docRef.id;
    } catch (error) {
      console.error('Error adding new PI:', error);
      toast.error(`Failed to generate new Proforma Invoice`)
      throw new Error('Failed to save new Proforma Invoice.');
    }
  }
  async updatePI(piId, piData) {
    try {
      const piRef = doc(db, 'performa_invoices', piId);
      await updateDoc(piRef, {
        ...piData,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Perform Invoice #${piData?.pi_number || ''} updated successfully`)
    } catch (error) {
      console.error('Error updating PI:', error);
      toast.error(`Failed to update the PI`)
      throw new Error('Failed to update Proforma Invoice.');
    }
  }
  async deletePI(piId, piNumber) {
    try {
      const piRef = doc(db, 'performa_invoices', piId);
      await deleteDoc(piRef);
      toast.success(`Perform Invoice #${piNumber || ''} deleted successfully`)
    } catch (error) {
      console.error('Error deleting PI:', error);
      toast.error(`Failed to delete the PI`)
      throw new Error('Failed to delete Proforma Invoice.');
    }
  }
}

const piService = new PIService();
export default piService;
