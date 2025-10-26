// src/firebase/roleService.js
import { db } from '../config/firebase.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class RoleService {
  // Get all roles
  async getAllRoles() {
    try {
      const rolesCollectionRef = collection(db, 'roles');
      const roleSnapshot = await getDocs(rolesCollectionRef);
      const roleList = roleSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      return roleList;
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error('Error occurred while fetching roles');
      throw error;
    }
  }

  // Get roles by department
  async getRolesByDepartment(departmentId) {
    try {
      const rolesCollectionRef = collection(db, 'roles');
      const q = query(rolesCollectionRef, where("department_id", "==", departmentId));
      const roleSnapshot = await getDocs(q);
      const roleList = roleSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      return roleList;
    } catch (error) {
      console.error("Error fetching roles by department:", error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(roleId) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      const roleSnap = await getDoc(roleDocRef);
      if (roleSnap.exists()) {
        return { id: roleSnap.id, ...roleSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      const rolesCollectionRef = collection(db, 'roles');
      const newRole = {
        ...roleData,
        permissions: roleData.permissions || {},
        createdAt: new Date(),
        status: 'active'
      };
      const docRef = await addDoc(rolesCollectionRef, newRole);
      toast.success('Role created successfully');
      return { id: docRef.id, ...newRole };
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error('Error occurred while creating role');
      throw error;
    }
  }

  // Update role permissions
  async updateRolePermissions(roleId, permissionsMap) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      await updateDoc(roleDocRef, {
        permissions: permissionsMap,
        updatedAt: new Date()
      });
      toast.success('Role permissions updated successfully');
      
      // TODO: Trigger cloud function to update user claims
      // await this.triggerClaimsUpdate(roleId);
      
    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error('Error occurred while updating role permissions');
      throw error;
    }
  }

  // Update role details
  async updateRole(roleId, updateData) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      await updateDoc(roleDocRef, {
        ...updateData,
        updatedAt: new Date()
      });
      toast.success('Role updated successfully');
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error('Error occurred while updating role');
      throw error;
    }
  }

  // Soft delete role
  async deleteRole(roleId) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      await updateDoc(roleDocRef, {
        status: 'inactive',
        updatedAt: new Date()
      });
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error('Error occurred while deleting role');
      throw error;
    }
  }
}

const roleService = new RoleService();
export default roleService;