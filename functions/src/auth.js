import {functions} from './firebase-functions'
import { db } from './firebaseAdmin.js';
import * as admin from 'firebase-admin';

export const setUserCustomClaims = functions.firestore
                                .document('users/{userId}')
                                .onUpdate(async (change, context)=> {
                                    const before = change.before.date();
                                    const after = change.after.data();
                                    const userId = context.params.userId;


                                    //Only process if user status has changed to active and has a role assigned
                                    if(before.status !== 'active' && after.status === 'active' && after.role){
                                        try {
                                            const roleDoc = await db.collection('roles').doc(after.role).get();
                                            if(!roleDoc.exists){
                                                console.log(`Role ${after.role} does not exist. Skipping custom claims assignment for user ${userId}`);
                                                return;
                                            }
                                            const roleData = roleDoc.data();
                                            const customClaims = {
                                                role: after.role,
                                                roleLevels: roleData.level || 1,
                                                officeId: after.officeId,
                                                departmentId: after.departmentId,
                                                isGlobal: roleData.isGlobal || false
                                            };

                                            // Set custom claims
                                            await admin.auth().setCustomUserClaims(userId, customClaims);
                                            console.log(`Custom claims set for user ${userId}:`, customClaims);
                                        } catch (error) {
                                            console.error(`Error setting custom claims for user ${userId}:`, error);
                                            throw error;
                                        }
                                    }

                                    //Clear claims if user status changed from active to non-active
                                    if(before.status === 'active' && after.status !== 'active'){
                                        try {
                                            await admin.auth().setCustomUserClaims(userId, null);
                                            console.log(`Custom claims cleared for user ${userId} due to status change to ${after.status}`);
                                        } catch (error) {
                                            console.error(`Error clearing custom claims for user ${userId}:`, error);
                                        }
                                    }
                                })


export const onUserRoleUpdate = functions.firestore
                                .document('users/{userId}')
                                .onUpdate(async (change, context) => {
                                    const before = change.before.data();
                                    const after = change.after.data();
                                    const userId = context.params.userId;

                                    //If role has changed and user is active, update claims
                                    if(before.role !== after.role && after.status === 'active' && after.role){
                                        try {
                                            const roleDoc = await db.collection('roles').doc(after.role).get();
                                            if(!roleDoc.exists){
                                                return;
                                            }
                                            const roleData = roleDoc.data();
                                            const customClaims = {
                                                role: after.role,
                                                roleLevels: roleData.level || 1,
                                                officeId: after.officeId,
                                                departmentId: after.departmentId,
                                                isGlobal: roleData.isGlobal || false
                                            };

                                            // Set custom claims
                                            await admin.auth().setCustomUserClaims(userId, customClaims);
                                            console.log(`Custom claims updated for user ${userId} with the new role ${after.role}`);
                                        } catch (error) {
                                            console.error(`Error updating custom claims for user ${userId}:`, error);
                                            throw error;
                                        }
                                    }
                                })

export const onUserUpdate = functions.firestore
                            .document('users/{userId}')
                            .onUpdate(async (change, context) => {
                                const before = change.before.data();
                                const after = change.after.data();
                                const userId = context.params.userId;

                                // Check if user is active and if any relevant fields have changed
                                if (after.status === 'active' && (
                                    before.role !== after.role ||
                                    before.officeId !== after.officeId ||
                                    before.departmentId !== after.departmentId
                                )) {
                                    try {
                                        // Only fetch role data if there's a role assigned
                                        let roleData = {};
                                        if (after.role) {
                                            const roleDoc = await db.collection('roles').doc(after.role).get();
                                            if (!roleDoc.exists) {
                                                console.log(`Role ${after.role} does not exist for user ${userId}`);
                                                return;
                                            }
                                            roleData = roleDoc.data();
                                        }

                                        const customClaims = {
                                            role: after.role || null,
                                            roleLevels: roleData.level || 1,
                                            officeId: after.officeId || null,
                                            departmentId: after.departmentId || null,
                                            isGlobal: roleData.isGlobal || false
                                        };

                                        // Set custom claims
                                        await admin.auth().setCustomUserClaims(userId, customClaims);
                                        console.log(`Custom claims updated for user ${userId}:`, customClaims);
                                    } catch (error) {
                                        console.error(`Error updating custom claims for user ${userId}:`, error);
                                        throw error;
                                    }
                                }
                            })