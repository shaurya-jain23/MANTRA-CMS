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
  runTransaction,
} from 'firebase/firestore';
import {convertTimestamps} from '../assets/helperFunctions.js'

class PIService {
  async getPINumber(piId = null) {
    try {
      if (piId) {
        const docSnap = await getDoc(doc(db, 'performa_invoices', String(piId)));
        return docSnap.data().pi_number;
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
        console.log(performa_invoices);
        
        return performa_invoices;
    } catch (error) {
      console.error('Error fetching all Performa Invoices:', error);
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
      return docRef.id;
    } catch (error) {
      console.error('Error adding new PI:', error);
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
    } catch (error) {
      console.error('Error updating PI:', error);
      throw new Error('Failed to update Proforma Invoice.');
    }
  }
}

const piService = new PIService();
export default piService;
