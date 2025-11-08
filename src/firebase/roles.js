import { db } from '../config/firebase.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class RoleService {
  // Get all roles
  async getAllRoles() {
    try {
      const rolesCollectionRef = collection(db, 'roles');
      const roleSnapshot = await getDocs(rolesCollectionRef);
      const roleList = roleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return roleList;
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Error occurred while fetching roles');
      throw error;
    }
  }

  // Get roles by department
  async getRolesByDepartment(departmentId) {
    try {
      const rolesCollectionRef = collection(db, 'roles');
      const q = query(rolesCollectionRef, where('departmentId', '==', departmentId));
      const roleSnapshot = await getDocs(q);
      const roleList = roleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return roleList;
    } catch (error) {
      console.error('Error fetching roles by department:', error);
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
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      const rolesDocRef = doc(db, 'roles', roleData.roleId);
      const newRole = {
        ...roleData,
        isGlobal: roleData.isGlobal || false,
        userCount: 0,
        permissions: roleData.permissions || {},
        createdAt: new Date(),
      };
      const docRef = await setDoc(rolesDocRef, newRole);
      toast.success('Role created successfully');
      return { id: rolesDocRef.id, ...newRole };
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.message || 'Error occurred while creating role');
      throw error;
    }
  }

  // Update role details
  async updateRole(roleId, updateData) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      await updateDoc(roleDocRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error occurred while updating role');
      throw error;
    }
  }

  // Clone a role
  async cloneRole(role, newOfficeId, newDepartmentId) {
    try {
      const { id, roleId, roleName, ...restOfRole } = role;
      const newRoleId = `${roleId.split('_').slice(0, -2).join('_')}_${newOfficeId}`;
      const newRoleName = `${roleName} (${newOfficeId})`;

      const clonedRole = {
        ...restOfRole,
        roleId: newRoleId,
        roleName: newRoleName,
        officeId: newOfficeId,
        departmentId: newDepartmentId,
        isGlobal: false, // Cloned roles are not global
        userCount: 0,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'roles'), clonedRole);
      toast.success(`Role cloned successfully to new office.`);
      return { id: docRef.id, ...clonedRole };
    } catch (error) {
      console.error('Error cloning role:', error);
      toast.error(error.message || 'Failed to clone role.');
      throw error;
    }
  }

  // Soft delete role
  async deleteRole(roleId) {
    try {
      const roleDocRef = doc(db, 'roles', roleId);
      await deleteDoc(roleDocRef);
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error occurred while deleting role');
      throw error;
    }
  }

  // Bulk delete roles
  async bulkDeleteRoles(roleIds) {
    try {
      const batch = writeBatch(db);
      roleIds.forEach(id => {
        const roleDocRef = doc(db, 'roles', id);
        batch.update(roleDocRef, { status: 'disabled', updatedAt: new Date() });
      });
      await batch.commit();
      toast.success(`${roleIds.length} roles deleted successfully.`);
    } catch (error) {
      console.error('Error bulk deleting roles:', error);
      toast.error('Failed to delete selected roles.');
      throw error;
    }
  }
}

const roleService = new RoleService();
export default roleService;