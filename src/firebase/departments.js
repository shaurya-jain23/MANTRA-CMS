// src/firebase/departmentService.js
import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class DepartmentService { 
  // Get all departments
  async getAllDepartments() {
    try {
      const departmentsCollectionRef = collection(db, 'departments');
      const departmentSnapshot = await getDocs(departmentsCollectionRef);
      const departmentList = departmentSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      return departmentList;
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error('Error occurred while fetching departments');
      throw error;
    }
  }

  // Get departments by office
  async getDepartmentsByOffice(officeId) {
    try {
      const departmentsCollectionRef = collection(db, 'departments');
      const q = query(departmentsCollectionRef, where("office_id", "==", officeId));
      const departmentSnapshot = await getDocs(q);
      const departmentList = departmentSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      return departmentList;
    } catch (error) {
      console.error("Error fetching departments by office:", error);
      throw error;
    }
  }

  // Get department by ID
  async getDepartmentById(departmentId) {
    try {
      const departmentDocRef = doc(db, 'departments', departmentId);
      const departmentSnap = await getDoc(departmentDocRef);
      if (departmentSnap.exists()) {
        return { id: departmentSnap.id, ...departmentSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  }

  // Create new department (superuser only)
  async createDepartment(departmentData) {
    try {
      const departmentsCollectionRef = collection(db, 'departments');
      const newDepartment = {
        ...departmentData,
        createdAt: new Date(),
        status: 'active'
      };
      const docRef = await addDoc(departmentsCollectionRef, newDepartment);
      toast.success('Department created successfully');
      return { id: docRef.id, ...newDepartment };
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error('Error occurred while creating department');
      throw error;
    }
  }

  // Update department
  async updateDepartment(departmentId, updateData) {
    try {
      const departmentDocRef = doc(db, 'departments', departmentId);
      await updateDoc(departmentDocRef, {
        ...updateData,
        updatedAt: new Date()
      });
      toast.success('Department updated successfully');
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error('Error occurred while updating department');
      throw error;
    }
  }

  // Soft delete department
  async deleteDepartment(departmentId) {
    try {
      const departmentDocRef = doc(db, 'departments', departmentId);
      await updateDoc(departmentDocRef, {
        status: 'inactive',
        updatedAt: new Date()
      });
      toast.success('Department deleted successfully');
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error('Error occurred while deleting department');
      throw error;
    }
  }
}

const departmentService = new DepartmentService();
export default departmentService;