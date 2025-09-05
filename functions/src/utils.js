import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { google } from "googleapis";


export async function getGoogleSheet(key, sheetTitle) {
  const SPREADSHEET_ID = "15jWPAxLgLfWAFPBdOAvRZ5sqHQy-z9SCaoP3eaTgR5c"; // Your Sheet ID
  const credentials = JSON.parse(key);
  const scopes = ["https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly"
  ];

  const auth = new JWT(
    {email: credentials.client_email,
    key: credentials.private_key,
    scopes: scopes,
  },
  );
  await auth.authorize();
  try {
    const drive = google.drive({ version: 'v3', auth });
    const driveResponse = await drive.files.get({
      fileId: SPREADSHEET_ID,
      fields: 'modifiedTime', // Specify which field to return
    });
    const lastModifiedTime = driveResponse.data.modifiedTime;
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
        throw new Error(`Sheet with title "${sheetTitle}" not found.`);
    }
    return {
      sheet: sheet,
      lastModifiedTime: lastModifiedTime,
    };
    
  } catch (error) {
    console.error("The Google API returned an error:", error);
    return null;
  }
}

/**
 * Formats booking details into a single string.
 */
export function formatBookingRemarks(booking) {
    const transportInfo = booking.transport.included === 'true'
        ? "Freight Included"
        : `Freight: ₹${booking.transport.charges || 0} Extra`;

    const extras = [
        booking.withBattery && "with Battery",
        booking.withCharger && "with Charger",
        booking.withTyre && "with Tyre"
    ].filter(Boolean).join(', ');

    return `Price: ₹${booking.pricePerPiece}/psc ${extras && ('| Extras: ' + extras)} | ${transportInfo}`;
}


