import { db } from '../config/firebase.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class OfficeService {
  // Get all offices
  async getAllOffices() {
    try {
      const officesCollectionRef = collection(db, 'offices');
      const officeSnapshot = await getDocs(officesCollectionRef);
      const officeList = officeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return officeList;
    } catch (error) {
      console.error('Error fetching offices:', error);
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
      console.error('Error fetching office:', error);
      throw error;
    }
  }

  // Create new office
  async createOffice(officeData) {
    try {
      const officesDocRef = doc(db, 'offices', officeData.officeId);
      const newOffice = {
        ...officeData,
        createdAt: new Date(),
        status: 'active',
      };
      await setDoc(officesDocRef, newOffice);
      toast.success('Office created successfully');
      return { id: officesDocRef.id, ...newOffice };
    } catch (error) {
      console.error('Error creating office:', error);
      toast.error('Error occurred while creating office');
      throw error;
    }
  }

  // Update office
  async updateOffice(officeId, updateData) {
    try {
      const officeDocRef = doc(db, 'offices', officeId);
      await updateDoc(officeDocRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      toast.success('Office updated successfully');
    } catch (error) {
      console.error('Error updating office:', error);
      toast.error('Error occurred while updating office');
      throw error;
    }
  }

  // Delete office (soft delete)
  async deleteOffice(officeId) {
    try {
      const officeDocRef = doc(db, 'offices', officeId);
      await updateDoc(officeDocRef, {
        status: 'inactive',
        updatedAt: new Date(),
      });
      toast.success('Office deleted successfully');
    } catch (error) {
      console.error('Error deleting office:', error);
      toast.error('Error occurred while deleting office');
      throw error;
    }
  }
}

const officeService = new OfficeService();
export default officeService;
