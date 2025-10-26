// src/firebase/office.js
import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class OfficeService {
  // Get all offices
  async getAllOffices() {
    try {
      const officesCollectionRef = collection(db, 'offices');
      const officeSnapshot = await getDocs(officesCollectionRef);
      const officeList = officeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return officeList;
    } catch (error) {
      console.error("Error fetching offices:", error);
      toast.error('Error occurred while fetching offices');
      throw error;
    }
  }

  // Get office by ID
  async getOfficeById(officeId) {
    try {
      const officeDocRef = doc(db, 'offices', officeId);
      const officeSnap = await getDoc(officeDocRef);
      if (officeSnap.exists()) {
        return { id: officeSnap.id, ...officeSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching office:", error);
      throw error;
    }
  }

  // Create new office (superuser only)
  async createOffice(officeData) {
    try {
      const officesCollectionRef = collection(db, 'offices');
      const newOffice = {
        ...officeData,
        createdAt: new Date(),
        status: 'active'
      };
      const docRef = await addDoc(officesCollectionRef, newOffice);
      toast.success('Office created successfully');
      return { id: docRef.id, ...newOffice };
    } catch (error) {
      console.error("Error creating office:", error);
      toast.error('Error occurred while creating office');
      throw error;
    }
  }
}

const officeService = new OfficeService();
export default officeService;