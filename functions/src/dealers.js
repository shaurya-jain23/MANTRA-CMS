import { params, firestore } from 'firebase-functions/v2';
import { getGoogleSheet } from './utils.js';
// import { db } from "./firebaseAdmin.js";

const googleServiceAccountKey = params.defineSecret('GOOGLE_SERVICE_ACCOUNT_KEY');

export const onDealerWriteSyncToSheet = firestore.onDocumentWritten(
  {
    document: 'dealers/{dealerId}',
    secrets: [googleServiceAccountKey],
  },
  async (event) => {
    const { sheet } = await getGoogleSheet(googleServiceAccountKey.value(), 'Dealers'); // Get the 'Dealers' sheet
    if (!sheet) {
      console.error("The 'Dealers' sheet was not found.");
      return;
    }

    const dealerId = event.params.dealerId;
    // const beforeData = event.data.before?.data();
    const dealerData = event.data.after.data(); // The new data of the document

    // If the document was deleted, do nothing for now (can add deletion logic later)
    if (!dealerData) {
      console.log(`Dealer ${dealerId} was deleted. No action taken in sheet.`);
      await deleteDealerFromSheet(sheet, dealerId);
      return;
    }

    try {
      const rows = await sheet.getRows();
      const rowIndex = rows.findIndex((row) => row.get('DEALER ID') === dealerId);
      await sheet.loadHeaderRow(1);
      if (rowIndex > -1) {
        // --- UPDATE EXISTING ROW ---
        console.log(`Updating existing dealer ${dealerId} in sheet.`);
        const row = rows[rowIndex];
        row.set('DEALER FIRM TRADENAME', dealerData.trade_name);
        row.set('GST NO.', dealerData.gst_no);
        row.set('CONTACT PERSON', dealerData.contact_person);
        row.set('PHONE NO.', dealerData.contact_number);
        row.set('STATE', dealerData.state);
        row.set('DISTRICT', dealerData.district);
        row.set('PINCODE', dealerData.pincode);
        row.set('SALES PERSON', dealerData.registered_by_name);
        row.set('STATUS', dealerData.status);
        await row.save();
      } else {
        // --- ADD NEW ROW ---
        console.log(`Adding new dealer ${dealerId} to sheet.`);
        await sheet.addRow({
          'DEALER ID': dealerId,
          'DEALER FIRM TRADENAME': dealerData.trade_name,
          'GST NO.': dealerData.gst_no,
          'CONTACT PERSON': dealerData.contact_person,
          'PHONE NO.': dealerData.contact_number,
          STATE: dealerData.state,
          DISTRICT: dealerData.district,
          PINCODE: dealerData.pincode,
          'SALES PERSON': dealerData.registered_by_name,
          STATUS: dealerData.status,
        });
      }
    } catch (error) {
      console.error(`Failed to sync dealer ${dealerId} to sheet:`, error);
    }
  }
);

async function deleteDealerFromSheet(sheet, dealerId) {
  try {
    const rows = await sheet.getRows();
    const rowIndex = rows.findIndex((row) => row.get('DEALER ID') === dealerId);

    if (rowIndex > -1) {
      console.log(`Deleting dealer ${dealerId} from sheet at row ${rowIndex + 2}`);
      await rows[rowIndex].delete();
      console.log(`Successfully deleted dealer ${dealerId} from sheet`);
    } else {
      console.log(`Dealer ${dealerId} not found in sheet, no deletion needed`);
    }
  } catch (error) {
    console.error(`Failed to delete dealer ${dealerId} from sheet:`, error);
    throw error; // Re-throw to handle in the main function if needed
  }
}
