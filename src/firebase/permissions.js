import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

class PermissionService {
  // Get all permissions
  async getAllPermissions() {
    try {
      const permissionsCollectionRef = collection(db, 'permissions');
      const permissionSnapshot = await getDocs(permissionsCollectionRef);
      const permissionList = permissionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return permissionList;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error occurred while fetching permissions');
      throw error;
    }
  }

  // Get permissions by category
  async getPermissionsByCategory(category) {
    try {
      const allPermissions = await this.getAllPermissions();
      return allPermissions.filter((perm) => perm.category === category);
    } catch (error) {
      console.error('Error fetching permissions by category:', error);
      throw error;
    }
  }

  // Create new permission
  async createPermission(permissionData) {
    try {
      const permissionsDocRef = doc(db, 'permissions', permissionData.permissionId);
      const newPermission = {
        ...permissionData,
        assignedToRoles: [],
        roleCount: 0,
        isSystemPermission: permissionData.isSystemPermission || false,
        createdAt: new Date(),
      };
      await setDoc(permissionsDocRef, newPermission);
      toast.success('Permission created successfully');
      return { id: permissionsDocRef.id, ...newPermission };
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Error occurred while creating permission');
      throw error;
    }
  }

  async updatePermission(permissionId, updateData) {
    try {
      const permissionDocRef = doc(db, 'permissions', permissionId);
      await updateDoc(permissionDocRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
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
      console.error('Error deleting permission:', error);
      toast.error('Error occurred while deleting permission');
      throw error;
    }
  }

  // Create default permissions
  async createDefaultPermissions() {
    const batch = writeBatch(db);
    const permissionsCollectionRef = collection(db, 'permissions');
    const defaultPermissions = [
        // Proforma Invoices
        { id: 'pi_create', name: 'Create PIs', resource: 'proforma_invoices', action: 'create', category: 'sales', risk: 'medium' },
        { id: 'pi_read', name: 'Read PIs', resource: 'proforma_invoices', action: 'read', category: 'sales', risk: 'low' },
        { id: 'pi_update', name: 'Update PIs', resource: 'proforma_invoices', action: 'update', category: 'sales', risk: 'medium' },
        { id: 'pi_delete', name: 'Delete PIs', resource: 'proforma_invoices', action: 'delete', category: 'sales', risk: 'high' },
        { id: 'pi_approve_level_1', name: 'Approve PIs Level 1', resource: 'proforma_invoices', action: 'approve', category: 'sales', risk: 'high' },
        { id: 'pi_approve_level_2', name: 'Approve PIs Level 2', resource: 'proforma_invoices', action: 'approve', category: 'sales', risk: 'high' },
        { id: 'pi_approve_level_3', name: 'Approve PIs Level 3', resource: 'proforma_invoices', action: 'approve', category: 'sales', risk: 'high' },
        { id: 'pi_export', name: 'Export PI Data', resource: 'proforma_invoices', action: 'export', category: 'sales', risk: 'medium' },
        
        // Bookings
        { id: 'booking_create', name: 'Create Bookings', resource: 'bookings', action: 'create', category: 'operations', risk: 'medium' },
        { id: 'booking_read', name: 'Read Bookings', resource: 'bookings', action: 'read', category: 'operations', risk: 'low' },
        { id: 'booking_update', name: 'Update Bookings', resource: 'bookings', action: 'update', category: 'operations', risk: 'medium' },
        { id: 'booking_delete', name: 'Delete Bookings', resource: 'bookings', action: 'delete', category: 'operations', risk: 'high' },
        { id: 'booking_approve', name: 'Approve Bookings', resource: 'bookings', action: 'approve', category: 'operations', risk: 'high' },
        
        // Users
        { id: 'user_read', name: 'Read Users', resource: 'users', action: 'read', category: 'hr', risk: 'low' },
        { id: 'user_create', name: 'Create Users', resource: 'users', action: 'create', category: 'hr', risk: 'high' },
        { id: 'user_update', name: 'Update Users', resource: 'users', action: 'update', category: 'hr', risk: 'medium' },
        { id: 'user_delete', name: 'Delete Users', resource: 'users', action: 'delete', category: 'hr', risk: 'critical' },
        { id: 'user_approve', name: 'Approve Users', resource: 'users', action: 'approve', category: 'hr', risk: 'high' },
        
        // System Administration
        { id: 'department_manage', name: 'Manage Departments', resource: 'departments', action: 'manage', category: 'system', risk: 'critical', isSystem: true },
        { id: 'role_manage', name: 'Manage Roles', resource: 'roles', action: 'manage', category: 'system', risk: 'critical', isSystem: true },
        { id: 'permission_manage', name: 'Manage Permissions', resource: 'permissions', action: 'manage', category: 'system', risk: 'critical', isSystem: true },
        { id: 'hierarchy_manage', name: 'Manage Hierarchies', resource: 'hierarchies', action: 'manage', category: 'system', risk: 'critical', isSystem: true },
      ];

    try {
      // To prevent duplicates, we can fetch existing permissionIds first, but for simplicity here we assume we are seeding.
      defaultPermissions.forEach(perm => {
        const docRef = doc(permissionsCollectionRef, perm.id);
        batch.set(docRef, {
          ...perm,
          permissionId: perm.id,
          assignedToRoles: [],
          roleCount: 0,
          status: 'active',
          description: 'default permission',
          isSystemPermission: perm.isSystemPermission || false,
          createdAt: new Date(),
        });
      });

      await batch.commit();
      toast.success('Default permissions created successfully!');
    } catch (error) {
      console.error('Error creating default permissions:', error);
      toast.error('Failed to create default permissions.');
      throw error;
    }
  }
}

const permissionService = new PermissionService();
export default permissionService;