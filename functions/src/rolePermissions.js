import {functions} from './firebase-functions'
import { db } from './firebaseAdmin.js';


export const syncRolePermissions = functions.firestore
                                .document('roles/{roleId')
                                .onWrite(async (change, context) => {
                                    const {roleId} = context.params;
                                    const beforeData = change.before.exists ? change.before.data() : null;
                                    const afterData = change.after.exists ? change.after.data() : null;

                                    try {
                                        if(!afterData && beforeData) {
                                            await removeRoleFromPermissions(roleId, beforeData.permissions);
                                            return
                                        }
                                        if(afterData){
                                            const oldPermissions = beforeData.permissions || {};
                                            const newPermissions = afterData.permissions || {};
                                            await updatePermissionAssignments(roleId, afterData, oldPermissions, newPermissions)
                                        }
                                        console.log(`Successfully synced permissions for role ${roleId}`);
                                    } catch (error) {
                                        console.error(`Error syncing permissions for role ${roleId}:`, error);
                                        throw error;
                                    }
                                })

export const cleanupPermissionAssignments = functions.firestore
                                        .document('permissions/{permissionId}')
                                        .onDelete(async (snap, context) => {
                                            const { permissionId } = context.params;
                                            try {
                                            await removePermissionFromAllRoles(permissionId);
                                            console.log(`Successfully cleaned up permission: ${permissionId}`);
                                            } catch (error) {
                                            console.error(`Error cleaning up permission ${permissionId}:`, error);
                                            throw error;
                                            }
                                        });


// Helper Functions
const removeRoleFromPermissions = async (roleId, permissions) => {
    const batch = db.batch();
    const permissionsIds = Object.keys(permissions || {});

    for(const permissionId of permissionsIds){
        const roleAssignmentRef = db.collection('permissions').doc(permissionId).collection('assignedToRoles').doc(roleId);
        batch.delete(roleAssignmentRef);
    }

    await batch.commit();
    console.log(`Removed role ${roleId} from ${permissionsIds.length} permissions`);
}

async function updatePermissionAssignments(roleId, roleData, oldPermissions, newPermissions) {
  const batch = db.batch();
  
  // Find permissions that were added and removed
  const addedPermissions = Object.keys(newPermissions).filter(
    permId => newPermissions[permId] && !oldPermissions[permId]
  );
  
  const removedPermissions = Object.keys(oldPermissions).filter(
    permId => oldPermissions[permId] && !newPermissions[permId]
  );

  // Add role to new permissions
  for (const permissionId of addedPermissions) {
    const roleAssignmentRef = db
      .collection('permissions')
      .doc(permissionId)
      .collection('assignedToRoles')
      .doc(roleId);
    
    batch.set(roleAssignmentRef, {
      roleId: roleId,
      roleName: roleData.roleName,
      officeId: roleData.officeId,
      departmentId: roleData.departmentId,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      isGlobal: roleData.isGlobal || false
    });
  }

  // Remove role from old permissions
  for (const permissionId of removedPermissions) {
    const roleAssignmentRef = db
      .collection('permissions')
      .doc(permissionId)
      .collection('assignedToRoles')
      .doc(roleId);
    
    batch.delete(roleAssignmentRef);
  }

  await batch.commit();
  
  console.log(`Updated permissions for role ${roleId}: +${addedPermissions.length}, -${removedPermissions.length}`);
}

const removePermissionFromAllRoles = async (permissionId) => {
  const rolesSnapshot = await db.collection('roles')
    .where(`permissions.${permissionId}` , '==', true)
    .get();

    const batch = db.batch();
    rolesSnapshot().forEach(roleDoc => {
      const docRef = roleDoc.ref;
      batch.update(docRef, {
        [`permissions.${permissionId}`]: admin.firestore.FieldValue.delete()
      });
    })

    await batch.commit();
    console.log(`Removed permission ${permissionId} from ${rolesSnapshot.size} roles`);
}

