import { params } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getGoogleSheet } from './utils.js';
import { db } from './firebaseAdmin.js';
import { parse, isValid, parseISO, isAfter, startOfMinute } from 'date-fns';

const googleServiceAccountKey = params.defineSecret('GOOGLE_SERVICE_ACCOUNT_KEY');

const IGNORED_HEADERS = [
  'BOOKING ORDER',
  'Stock At Transporter',
  'Transfers',
  'UPDATE TIMESTAMPS',
  // Add more headers to ignore here, e.g., 'EXTRA PARTS'
];

const NUMERIC_HEADERS = ['Qty', 'Shipping Rent'];

const DATE_HEADERS = ['ETD', 'ETA'];
const BOOLEAN_HEADERS = ['DO RECEIVED', 'TELEX RECEIVED'];

// export const scheduledSheetSync = pubsub.onSchedule({
//     schedule: "every 15 minutes",
//     secrets: [googleServiceAccountKey],
// }, async (event) => {
//     console.log("Running scheduled sync from Google Sheet to Firestore...");

//   try {
//     const sheet = await getGoogleSheet(googleServiceAccountKey.value(), "MASTER");
//     const rows = await sheet.getRows();
//     const headers = sheet.headerValues;

//     const batch = db.batch();

//     rows.forEach(row => {
//       const containerNo = row.get("CONTAINER NO");
//       if (containerNo) {
//         const containerRef = db.collection("containers").doc(containerNo);

//         const docData = {};
//         headers.forEach(header => {
//           if (IGNORED_HEADERS.includes(header.trim())) {
//             return;
//           }
//           const key = header.trim().replace(/\s+/g, '_').toLowerCase();
//           const value = row.get(header);
//           if (value !== null && value !== undefined) {
//             if ((key === 'eta' || key === 'etd') && typeof value === 'string' && value.match(/^\d{2}-[A-Za-z]{3}$/)) {
//                // Assuming format is '25-Aug'. Appending current year.
//                // For more robust parsing, a library like date-fns would be ideal.
//                docData[key] = new Date(`${value}-${new Date().getFullYear()}`);
//             } else {
//                docData[key] = value;
//             }
//           }
//         });

//         batch.set(containerRef, docData, { merge: true });
//       }
//     });

//     await batch.commit();
//     console.log(`Successfully synced ${rows.length} rows to Firestore.`);
//     return null;

//   } catch (error) {
//     console.error("Error during scheduled sheet sync:", error);
//     return null;
//   }
// });

export const scheduledSheetSync = onSchedule(
  {
    schedule: 'every 15 minutes',
    secrets: [googleServiceAccountKey],
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    console.log(event);

    console.log('Running scheduled sync from Google Sheet to Firestore...');

    try {
      const sheetData = await getGoogleSheet(googleServiceAccountKey.value(), 'MASTER');
      if (!sheetData) {
        console.error('Failed to retrieve sheet data and metadata.');
        return;
      }
      const { sheet, lastModifiedTime } = sheetData;
      const sheetLastModified = parseISO(lastModifiedTime);
      console.log('Last modified time:', sheetLastModified);
      const metaRef = db.collection('meta').doc('sheetSync');
      const metaSnap = await metaRef.get();
      const lastSyncTime = metaSnap.exists ? new Date(metaSnap.data().lastSync) : new Date(0);
      console.log(lastSyncTime);
      const sheetLastModifiedNormalized = startOfMinute(sheetLastModified);
      const lastSyncTimeNormalized = startOfMinute(lastSyncTime);

      if (!isAfter(sheetLastModifiedNormalized, lastSyncTimeNormalized)) {
        console.log('No changes detected in Google Sheet since last sync. Skipping run.');
        return null; // Exit the function early
      }
      console.log('Sheet has been updated. Starting full sync process...');

      const rows = await sheet.getRows();
      await sheet.loadHeaderRow(1);
      // Filter out the ignored headers immediately.
      const headers = sheet.headerValues.filter((h) => !IGNORED_HEADERS.includes(h.trim()));

      // Use a Map to store the latest version of each container, handling duplicates.
      const uniqueContainers = new Map();

      rows.forEach((row) => {
        const containerNo = row.get('CONTAINER NO');
        const eta = row.get('ETA');
        const etd = row.get('ETD');
        if (containerNo && (eta || etd)) {
          const docData = {};
          headers.forEach((header) => {
            const key = header.trim().replace(/\s+/g, '_').toLowerCase();
            const value = row.get(header);
            if (value !== null && value !== undefined && value !== '') {
              if (NUMERIC_HEADERS.includes(header)) {
                docData[key] = parseFloat(String(value).replace(/,/g, '')) || 0;
              } else if (DATE_HEADERS.includes(header)) {
                const date = parse(value, 'dd-MMM', new Date());
                if (isValid(date)) {
                  docData[key] = date; // The Admin SDK will convert this to a Firestore Timestamp
                } else {
                  console.error('Failed to parse date:', value);
                }
              } else if (BOOLEAN_HEADERS.includes(headers)) {
                const lowerStr = docData[key].toLowerCase();
                docData[key] = lowerStr === 'yes' ? true : false;
              } else {
                docData[key] = String(value);
              }
            } else {
              docData[key] = 'N/A';
            }
          });
          uniqueContainers.set(containerNo, docData);
        }
      });

      const allWrites = Array.from(uniqueContainers.entries());
      if (allWrites.length === 0) {
        console.log('No valid container data found in the sheet to sync.');
        return null;
      }

      // Commit changes to Firestore in chunks of 400.
      const chunkSize = 400;
      for (let i = 0; i < allWrites.length; i += chunkSize) {
        const chunk = allWrites.slice(i, i + chunkSize);
        const batch = db.batch();

        chunk.forEach(([containerId, data]) => {
          const docRef = db.collection('containers').doc(containerId);
          batch.set(docRef, data, { merge: true });
        });

        await batch.commit();
        console.log(`Successfully committed a chunk of ${chunk.length} containers.`);
      }

      console.log(`Sync complete. Total unique containers processed: ${allWrites.length}`);
      await metaRef.set(
        {
          lastSync: new Date().toISOString(), // Set to the current time
          sheetTitle: sheet.title,
        },
        { merge: true }
      );
      return null;
    } catch (error) {
      console.error('Error during scheduled sheet sync:', error);
      return null;
    }
  }
);
