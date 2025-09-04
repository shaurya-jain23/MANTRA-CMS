import { db } from '../config/firebase.js';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const approveAndSyncBookingCallable = httpsCallable(functions, 'approveAndSyncBooking');

class BookingService {
  // Create a new booking request in the 'bookings' collection
    async createBooking(bookingData) {
        try {
        // Add references to the user, container, and dealer
        const bookingPayload = {
            ...bookingData,
            containerRef: doc(db, 'containers', bookingData.containerId),
            dealerRef: doc(db, 'dealers', bookingData.dealerId),
            userRef: doc(db, 'users', bookingData.registeredBy),
            status: 'Pending', // Default status for all new requests
            rejectionReason: '',
            createdAt: serverTimestamp(),
        };
        
        const docRef = await addDoc(collection(db, 'bookings'), bookingPayload);
        return { id: docRef.id, ...bookingPayload };
        } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Could not create booking request.");
        }
    }

  // Fetch all bookings made by a specific salesperson
    async getBookings(user) {
        const isAdminUser = user.role === 'superuser' || user.role === 'admin';
        const q = isAdminUser
        ? query(collection(db, 'bookings')) // Superuser gets all bookings
        : query(collection(db, 'bookings'), where('registeredBy', '==', user.uid));
        try {
            const querySnapshot = await getDocs(q);
            const bookings = [];
            for (const doc of querySnapshot.docs) {
                const bookingData = doc.data();
                
                // Fetch related container and dealer data for display
                const containerSnap = await getDoc(bookingData.containerRef);
                const dealerSnap = await getDoc(bookingData.dealerRef);
                const userSnap = await getDoc(bookingData.userRef);
                
                bookings.push({ 
                id: doc.id, 
                ...bookingData,
                container: containerSnap.exists() ? {id: bookingData.containerId , ...containerSnap.data()} : null,
                dealer: dealerSnap.exists() ? dealerSnap.data() : null,
                requested_by_name: userSnap.exists() ? userSnap.data().displayName : 'Unknown',
                });
            }
            return bookings;
        } catch (error) {
        console.error("Error fetching bookings:", error);
        throw new Error("Could not fetch bookings.");
        }
    }

    async updateBooking(bookingId, bookingData) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) throw new Error("Booking not found!");
      const containerRef = bookingData.containerRef;
      await updateDoc(bookingRef, { ...bookingData, status: 'Pending', rejectionReason: '' });
      await updateDoc(containerRef, { 
          sales_status: 'Pending Approval',
          party_name: '' ,
          destination: ''
        });
    } catch (error) {
      console.error("Error updating booking:", error);
      throw new Error("Could not update booking.");
    }
    }
    async deleteBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) throw new Error("Booking not found!");
      const bookingData = bookingSnap.data();
      const containerRef = bookingData.containerRef;
      await deleteDoc(bookingRef);
      await updateDoc(containerRef, { 
          sales_status: 'Available for sale',
          party_name: '' ,
          destination: ''
        });
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw new Error("Could not delete booking.");
    }
    }
  
    // async approveBooking(bookingId) {
    //     try {
    //     const bookingRef = doc(db, 'bookings', bookingId);
    //     const bookingSnap = await getDoc(bookingRef);
    //     if (!bookingSnap.exists()) throw new Error("Booking not found!");
    //     const bookingData = bookingSnap.data();
        
    //     const dealerSnap = await getDoc(bookingData.dealerRef);
        
    //     const containerRef = bookingData.containerRef;
    //     //Update the booking status to Approved
    //     await updateDoc(bookingRef, { status: 'Approved', rejectionReason: '' });

    //     await updateDoc(containerRef, { 
    //       sales_status: `Blocked`,
    //       party_name: dealerSnap.exists() ? dealerSnap.data().trade_name : null,
    //       destination: bookingData.placeOfDelivery
    //     });

    //     // Update the container's sales status and party name
    //     } catch (error) {
    //     throw error;
    //     }
    // }

    async approveAndSyncBooking(bookingId) {
        try {
            const result = await approveAndSyncBookingCallable({ bookingId });
            return result.data;
        } catch (error) {
            console.error("Error calling approveAndSyncBooking function:", error);
            throw new Error("Failed to approve and sync booking.");
        }
    }

    async rejectBooking(bookingId, reason) {
        try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) throw new Error("Booking not found!");
        const bookingData = bookingSnap.data();
        const containerRef = bookingData.containerRef;
        await updateDoc(bookingRef, { status: 'Rejected', rejectionReason: reason });
        await updateDoc(containerRef, { 
          sales_status: 'Available for sale',
          party_name: '' ,
          destination: ''
        });
        } catch (error) {
        throw error;
        }
    }
    async updateContainerStatus(containerId, newStatus, partyName) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      await updateDoc(containerRef, {
        sales_status: newStatus,
        party_name: partyName
      });
    } catch (error) {
      console.error("Error updating container status:", error);
      throw new Error("Could not update container status.");
    }
  }

}

const bookingService = new BookingService();
export default bookingService;

