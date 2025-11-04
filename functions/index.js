import * as bookings from './src/bookings.js';
import * as dealers from './src/dealers.js';
import * as sync from './src/containers.js';
// import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import './src/firebaseAdmin.js';

setGlobalOptions({
  maxInstances: 10,
  region: 'asia-south1',
});

export const deleteUserOnFirestoreDelete = onDocumentDeleted('users/{userId}', async (event) => {
  const userId = event.params.userId;

  logger.info(`Attempting to delete Firebase Auth user for Firestore document: ${userId}`);

  try {
    await getAuth().deleteUser(userId);
    logger.info(`Successfully deleted user ${userId} from Firebase Auth.`);
  } catch (error) {
    logger.error(`Error deleting user ${userId} from Firebase Auth:`, error);
  }
});

// Exports other functions directly
// export const bookings = bookings;
// export const dealers = dealers;
// export const sync = sync;

export const { approveAndSyncBooking, deleteAndSyncBooking } = bookings;

export const { onDealerWriteSyncToSheet } = dealers;

export const { scheduledSheetSync } = sync;
