import { https, params } from "firebase-functions/v2";
import { FieldValue } from "firebase-admin/firestore";
import { getGoogleSheet, formatBookingRemarks } from "./utils.js";
import { db } from "./firebaseAdmin.js";


const googleServiceAccountKey = params.defineSecret("GOOGLE_SERVICE_ACCOUNT_KEY");



// Approve Booking Function
export const approveAndSyncBooking = https.onCall({ secrets: [googleServiceAccountKey] }, async (request) => {
  // Check for authentication
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "You must be logged in.");
  }

  const { bookingId } = request.data;
  const approver = {
      uid: request.auth.uid,
      name: request.auth.token.name || null
  };

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
        throw new https.HttpsError("not-found", "Booking not found.");
    }
    const booking = bookingSnap.data();
    const containerRef = booking.containerRef;
    const dealerRef = booking.dealerRef;

    const [containerSnap, dealerSnap] = await Promise.all([containerRef.get(), dealerRef.get()]);

    const partyName = dealerSnap.exists ? dealerSnap.data().trade_name.toUpperCase() : 'Unknown Dealer';
    const destination = booking.placeOfDelivery.toUpperCase() || (dealerSnap.exists ? dealerSnap.data().district.toUpperCase() : 'N/A');

    // 1. Update Firestore Collections
    const bookingUpdate = bookingRef.update({
        status: "Approved",
        approvedBy: approver.name,
        approvedAt: FieldValue.serverTimestamp()
    });
    const containerUpdate = containerRef.update({
        sales_status: "Blocked",
        party_name: partyName,
        destination: destination
    });
    await Promise.all([bookingUpdate, containerUpdate]);
    
    console.log("Firestore updates successful. Starting Google Sheet sync.");
    // 2. Sync with Google Sheet
    const {sheet} = await getGoogleSheet(googleServiceAccountKey.value(), 'MASTER');
    await sheet.loadHeaderRow(1);
    const rows = await sheet.getRows();
    const containerNo = containerSnap.data().container_no;

    const rowIndex = rows.findIndex(row => {
      const values = row._rawData;
      const sheetContainerNo = values[4]; 
      return sheetContainerNo?.toString().trim() === containerNo
    });
    console.log(`Result of findIndex (should be 0 or greater if found): ${rowIndex}`);

    if (rowIndex > -1) {
        const row = rows[rowIndex];
        row.set("PARTY NAME", partyName);
        row.set("Destination", destination);
        row.set("SALES Status", "Blocked");
        row.set("Booking Remarks", formatBookingRemarks(booking)); // Z
        await row.save(); 
    }
    
    return { success: true, message: "Booking approved and synced successfully." };
  } catch (error) {
    console.error("Error in approveAndSyncBooking:", error);
    throw new https.HttpsError("internal", "An error occurred while syncing.", error.message);
  }
});


export const deleteAndSyncBooking = https.onCall({ secrets: [googleServiceAccountKey] }, async (request) => {
    if (!request.auth) throw new https.HttpsError("unauthenticated", "You must be logged in.");

    const { bookingId } = request.data;
    
    try {
        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        const bookingData = bookingSnap.data();
        if (!bookingSnap.exists) throw new https.HttpsError("not-found", "Booking not found.");

        const containerRef = bookingSnap.data().containerRef;

        // 1. Update Firestore
        await containerRef.update({ sales_status: "Available for Sale", party_name: "", destination: "" });
        await bookingRef.delete();

        if(bookingData.status === 'Approved'){
          // 2. Sync with Google Sheet
          const {sheet} = await getGoogleSheet(googleServiceAccountKey.value(), 'MASTER');
          const rows = await sheet.getRows();
          const containerSnap = await containerRef.get();
          const containerNo = containerSnap.data().container_no;
          const rowIndex = rows.findIndex(row => row.get("CONTAINER NO") === containerNo);

          if (rowIndex > -1) {
              rows[rowIndex].set("PARTY NAME", "");
              rows[rowIndex].set("Destination", "");
              rows[rowIndex].set("SALES Status", "Available for Sale");
              rows[rowIndex].set("Booking Remarks", "");
              await rows[rowIndex].save();
          }
          
          return { success: true, message: "Booking deleted and synced." };
        }

    } catch (error) {
        console.error("Error in deleteAndSyncBooking:", error);
        throw new https.HttpsError("internal", "An error occurred.", error.message);
    }
});


// export const updateAndSyncBooking = https.onCall({ secrets: [googleServiceAccountKey] }, async (request) => {
//     if (!request.auth) throw new https.HttpsError("unauthenticated", "You must be logged in.");

//     const { bookingId, updatedData } = request.data;

//     try {
//         const bookingRef = db.collection("bookings").doc(bookingId);
        
//         // 1. Update Firestore
//         await bookingRef.update({ ...updatedData, status: "Pending", rejectionReason: "" });

//         // 2. Sync with Google Sheet (update remarks and status)
//         const sheet = await getMasterSheet(googleServiceAccountKey.value());
//         const rows = await sheet.getRows();
//         const bookingSnap = await bookingRef.get();
//         const containerSnap = await bookingSnap.data().containerRef.get();
//         const containerNo = containerSnap.data().container_no;
//         const rowIndex = rows.findIndex(row => row.get("CONTAINER NO") === containerNo);

//         if (rowIndex > -1) {
//             rows[rowIndex].set("SALES Status", "Pending Booking"); // Reflects the re-approval needed
//             rows[rowIndex].set("Booking Remarks", formatBookingRemarks(updatedData));
//             await rows[rowIndex].save();
//         }

//         return { success: true, message: "Booking updated and synced." };
//     } catch (error) {
//         console.error("Error in updateAndSyncBooking:", error);
//         throw new https.HttpsError("internal", "An error occurred.", error.message);
//     }
// });