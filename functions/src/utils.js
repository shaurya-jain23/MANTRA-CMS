import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";


export async function getGoogleSheet(key, sheetTitle) {
  const SPREADSHEET_ID = "15jWPAxLgLfWAFPBdOAvRZ5sqHQy-z9SCaoP3eaTgR5c"; // Your Sheet ID
  const credentials = JSON.parse(key);
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

  const auth = new JWT(
    {email: credentials.client_email,
    key: credentials.private_key,
    scopes: scopes,
  },
  );

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  return doc.sheetsByTitle[sheetTitle]; // Dynamic sheet title
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
