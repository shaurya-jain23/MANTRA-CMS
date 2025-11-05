import {functions} from './firebase-functions'
import { db } from './firebaseAdmin.js';
import * as admin from 'firebase-admin';

/**
 * Comprehensive cloud function to manage user custom claims
 * Handles:
 * 1. Setting claims when user becomes active with a role
 * 2. Clearing claims when user becomes inactive
 * 3. Updating claims when role/office/department changes
 */
export const manageUserCustomClaims = functions.firestore
                                .document('users/{userId}')
                                .onUpdate(async (change, context)=> {
                                    const before = change.before.data();
                                    const after = change.after.data();
                                    const userId = context.params.userId;

                                    try {
                                        // Case 1: User status changed from non-active to active with a role
                                        if(before.status !== 'active' && after.status === 'active' && after.role){
                                            const roleDoc = await db.collection('roles').doc(after.role).get();
                                            if(!roleDoc.exists){
                                                console.error(`Role ${after.role} not found for user ${userId}`);
                                                return;
                                            }
                                            const roleData = roleDoc.data();
                                            const customClaims = {
                                                role: after.role,
                                                roleLevel: roleData.level || 1,
                                                officeId: after.officeId,
                                                departmentId: after.departmentId,
                                                isGlobal: roleData.isGlobal || false
                                            };

                                            // Set custom claims first
                                            await admin.auth().setCustomUserClaims(userId, customClaims);
                                            console.log(`Custom claims set for user ${userId}:`, customClaims);
                                            
                                            // Signal to client that claims are ready
                                            await change.after.ref.update({
                                                claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                                            });
                                            console.log(`Claims signal sent for user ${userId}`);
                                            return;
                                        }

                                        // Case 2: User status changed from active to non-active
                                        if(before.status === 'active' && after.status !== 'active'){
                                            // Clear custom claims
                                            await admin.auth().setCustomUserClaims(userId, null);
                                            console.log(`Custom claims cleared for user ${userId} due to status change to ${after.status}`);
                                            
                                            // Signal that claims have been cleared
                                            await change.after.ref.update({
                                                claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                                            });
                                            return;
                                        }

                                        // Case 3: User is active and role/office/department changed
                                        if (after.status === 'active' && (
                                            before.role !== after.role ||
                                            before.officeId !== after.officeId ||
                                            before.departmentId !== after.departmentId
                                        )) {
                                            // Fetch role data if there's a role assigned
                                            let roleData = {};
                                            if (after.role) {
                                                const roleDoc = await db.collection('roles').doc(after.role).get();
                                                if (!roleDoc.exists) {
                                                    console.error(`Role ${after.role} not found for user ${userId}`);
                                                    return;
                                                }
                                                roleData = roleDoc.data();
                                            }

                                            const customClaims = {
                                                role: after.role || null,
                                                roleLevel: roleData.level || 1,
                                                officeId: after.officeId || null,
                                                departmentId: after.departmentId || null,
                                                isGlobal: roleData.isGlobal || false
                                            };

                                            // Update custom claims first
                                            await admin.auth().setCustomUserClaims(userId, customClaims);
                                            console.log(`Custom claims updated for user ${userId}:`, customClaims);
                                            
                                            // Signal to client that claims are ready
                                            await change.after.ref.update({
                                                claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                                            });
                                            console.log(`Claims update signal sent for user ${userId}`);
                                        }
                                    } catch (error) {
                                        console.error(`Error managing custom claims for user ${userId}:`, error);
                                        throw error;
                                    }
                                })
