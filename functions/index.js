

// Import and export all functions from their respective files
import * as bookings from './src/bookings.js';
import * as dealers from './src/dealers.js';

export const {
    approveAndSyncBooking,
} = bookings;

export const {
    onDealerWriteSyncToSheet
} = dealers;

