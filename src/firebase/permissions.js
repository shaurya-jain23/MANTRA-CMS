import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class PermissionService {
  // Get all permissions
  async getAllPermissions() {
    try {
      const permissionsCollectionRef = collection(db, 'permissions');
      const permissionSnapshot = await getDocs(permissionsCollectionRef);
      const permissionList = permissionSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      return permissionList;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error('Error occurred while fetching permissions');
      throw error;
    }
  }

  // Get permissions by category
  async getPermissionsByCategory(category) {
    try {
      const allPermissions = await this.getAllPermissions();
      return allPermissions.filter(perm => perm.category === category);
    } catch (error) {
      console.error("Error fetching permissions by category:", error);
      throw error;
    }
  }

  // Create new permission
  async createPermission(permissionData) {
    try {
      const permissionsCollectionRef = collection(db, 'permissions');
      const newPermission = {
        ...permissionData,
        createdAt: new Date(),
        status: 'active'
      };
      const docRef = await addDoc(permissionsCollectionRef, newPermission);
      toast.success('Permission created successfully');
      return { id: docRef.id, ...newPermission };
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error('Error occurred while creating permission');
      throw error;
    }
  }

  // Update permission
  async updatePermission(permissionId, updateData) {
    try {
      const permissionDocRef = doc(db, 'permissions', permissionId);
      await updateDoc(permissionDocRef, {
        ...updateData,
        updatedAt: new Date()
      });
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error('Error occurred while updating permission');
      throw error;
    }
  }

  // Delete permission
  async deletePermission(permissionId) {
    try {
      const permissionDocRef = doc(db, 'permissions', permissionId);
      await deleteDoc(permissionDocRef);
      toast.success('Permission deleted successfully');
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error('Error occurred while deleting permission');
      throw error;
    }
  }
}

const permissionService = new PermissionService();
export default permissionService;