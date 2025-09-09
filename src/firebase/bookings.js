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
import {convertTimestamps} from '../assets/helperFunctions.js'

import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const approveAndSyncBookingCallable = httpsCallable(functions, 'approveAndSyncBooking');
const deleteAndSyncBookingCallable = httpsCallable(functions, 'deleteAndSyncBooking');

class BookingService {
  // Create a new booking request in the 'bookings' collection
    async createBooking(bookingData) {
        try {
        // Add references to the user, container, and dealer
        const bookingPayload = {
            ...bookingData,
            containerRef: doc(db, 'containers', bookingData.containerId),
            dealerRef: doc(db, 'dealers', bookingData.dealerId),
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
    async getBookings(userId, role) {
        const isAdminUser = role === 'superuser' || role === 'admin';
        const q = isAdminUser
        ? query(collection(db, 'bookings')) // Superuser gets all bookings
        : query(collection(db, 'bookings'), where('registeredBy', '==', userId));
        try {
            const querySnapshot = await getDocs(q);
            const bookings = querySnapshot.docs.map(doc => {
              const data = convertTimestamps(doc.data());
              const { containerRef, dealerRef, ...rest } = data; 
               return {
                id: doc.id,
                 ...rest,
               } });
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
      const updatePayload = {
            ...bookingData,
            dealerRef: doc(db, 'dealers', bookingData.dealerId),
            status: 'Pending', 
            rejectionReason: '',
            updatedAt: serverTimestamp(),
        };
        if(bookingData.status === 'Approved'){
          if(bookingData.party_name !== bookingSnap.data().party_name){
              await updateDoc(containerRef, { 
              sales_status: 'Pending Approval',
              party_name: '' ,
              destination: ''
          });
          }
          else if(bookingData.destination !== bookingSnap.data().destination){
              await updateDoc(containerRef, { 
                sales_status: 'Pending Approval',
                destination: ''
              });
          }
        }
      await updateDoc(bookingRef, updatePayload);
    } catch (error) {
      console.error("Error updating booking:", error);
      throw new Error("Could not update booking.");
    }
    }

    async deleteBooking(booking) {
    try {
      const {id, containerId, container, dealerId, registeredBy, status} = booking
      const bookingData = {id, container_no: container.container_no, dealerId, containerId,registeredBy, status}
      console.log(bookingData);
      
      const result = await deleteAndSyncBookingCallable({ bookingData });
      return result.data;
    } catch (error) {
      console.error("deleteBooking service error:", error);
      throw new Error(error.message || "Failed to delete booking.");
    }
  }
  

    async approveAndSyncBooking(bookingData) {
        try {
          const {id, placeOfDelivery, container, dealer,dealerId, registeredBy} = bookingData
          const booking = {id, placeOfDelivery, container_no: container.container_no, dealerId, registeredBy, trade_name: dealer.trade_name, district: dealer.district}
            const result = await approveAndSyncBookingCallable({ booking });
            return result.data;
        } catch (error) {
            console.error("Error calling approveAndSyncBooking function:", error);
            throw new Error("Failed to approve and sync booking.");
        }
    }

    async rejectBooking(booking, reason) {
        try {
        const bookingRef = doc(db, 'bookings', booking.id);
        const containerRef = booking.containerRef;
        
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

