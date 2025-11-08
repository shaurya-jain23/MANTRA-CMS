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
  serverTimestamp,
} from 'firebase/firestore';
import { convertTimestamps, convertStringsToTimestamps } from '../assets/helperFunctions';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'react-hot-toast';
const functions = getFunctions();
const approveAndSyncBookingCallable = httpsCallable(functions, 'approveAndSyncBooking');
const deleteAndSyncBookingCallable = httpsCallable(functions, 'deleteAndSyncBooking');

class BookingService {
  async getBookingId(bId = null) {
    try {
      if (bId) {
        const docSnap = await getDoc(doc(db, 'bookings', String(bId)));
        return docSnap.data();
      }
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      let maxNum = 0;
      querySnapshot.forEach((doc) => {
        const book = doc.data();
        const num = parseInt(book?.booking_id?.split('-')[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const newCount = String(maxNum + 1).padStart(3, '0');
      const newBookingId = `${year}${month}${day}-${newCount}`;
      return newBookingId;
    } catch (error) {
      console.error('Error generating Booking Id:', error);
      toast.error(`Error occured while generating Booking Id`);
      throw new Error('Could not generate a new Booking Id.');
    }
  }
  async createBooking(bookingData) {
    try {
      const bookingPayload = {
        ...bookingData,
        containerRef: doc(db, 'containers', bookingData.containerId),
        dealerRef: doc(db, 'dealers', bookingData.dealerId),
        status: 'Pending',
        rejectionReason: '',
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'bookings'), bookingPayload);
      return { id: docRef.id, ...bookingPayload };
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(`Error creating booking: ${error.message}`);
      throw new Error('Could not create booking request.');
    } finally {
      toast.success('New booking created successfully');
    }
  }

  async getBookings(userId, role) {
    const isAdminUser = role === 'superuser' || role === 'admin';
    const q = isAdminUser
      ? query(collection(db, 'bookings')) // Superuser gets all bookings
      : query(collection(db, 'bookings'), where('registeredBy', '==', userId));
    try {
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map((doc) => {
        const data = convertTimestamps(doc.data());
        const { containerRef, dealerRef, ...rest } = data;
        return {
          id: doc.id,
          ...rest,
        };
      });
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(`Failed to load the bookings`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not fetch bookings.');
    }
  }

  async updateBooking(bookingId, bookingData) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) throw new Error('Booking not found!');
      const containerRef = bookingData.containerRef;
      const bookingDataToUpdate = convertStringsToTimestamps(bookingData);
      const updatePayload = {
        ...bookingDataToUpdate,
        dealerRef: doc(db, 'dealers', bookingData.dealerId),
        status: 'Pending',
        rejectionReason: '',
        updatedAt: serverTimestamp(),
      };
      if (bookingData.status === 'Approved') {
        if (bookingData.party_name !== bookingSnap.data().party_name) {
          await updateDoc(containerRef, {
            sales_status: 'Pending Approval',
            party_name: '',
            destination: '',
          });
        } else if (bookingData.destination !== bookingSnap.data().destination) {
          await updateDoc(containerRef, {
            sales_status: 'Pending Approval',
            destination: '',
          });
        }
      }
      await updateDoc(bookingRef, updatePayload);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(`Failed to update the booking`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not update booking.');
    } finally {
      toast.success(`Booking of #${bookingData?.containerId || ''} updated successfully`);
    }
  }

  async deleteBooking(booking) {
    try {
      const { id, containerId, container, dealerId, registeredBy, status } = booking;
      const bookingData = {
        id,
        container_no: container.container_no,
        dealerId,
        containerId,
        registeredBy,
        status,
      };
      console.log(bookingData);

      const result = await deleteAndSyncBookingCallable({ bookingData });
      return result.data;
    } catch (error) {
      console.error('deleteBooking service error:', error);
      toast.error(`Failed to delete the booking`);
      toast.error(`Error: ${error.message}`);
      throw new Error(error.message || 'Failed to delete booking.');
    } finally {
      toast.success(`Booking for #${booking?.containerId || ''} deleted successfully`);
    }
  }

  async approveAndSyncBooking(bookingData) {
    try {
      const { id, placeOfDelivery, container, dealer, dealerId, registeredBy } = bookingData;
      const booking = {
        id,
        placeOfDelivery,
        container_no: container.container_no,
        dealerId,
        registeredBy,
        trade_name: dealer.trade_name,
        district: dealer.district,
      };
      const result = await approveAndSyncBookingCallable({ booking });
      return result.data;
    } catch (error) {
      console.error('Error calling approveAndSyncBooking function:', error);
      toast.error(`Failed to approve and sync the booking`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Failed to approve and sync booking.');
    } finally {
      toast.success(`Booking #${bookingData?.containerId || ''} approved successfully`);
    }
  }

  async rejectBooking(booking, reason) {
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      const containerRef = booking.containerRef;

      await updateDoc(bookingRef, { status: 'Rejected', rejectionReason: reason });
      await updateDoc(containerRef, {
        sales_status: 'Available for sale',
        party_name: '',
        destination: '',
      });
    } catch (error) {
      toast.error(`Failed to reject booking request.`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Failed not reject booking');
    } finally {
      toast.success(`Successfully rejected the booking.`);
    }
  }
  async updateContainerStatus(containerId, newStatus, partyName) {
    try {
      const containerRef = doc(db, 'containers', containerId);
      await updateDoc(containerRef, {
        sales_status: newStatus,
        party_name: partyName,
      });
    } catch (error) {
      console.error('Error updating container status:', error);
      toast.error(`Failed to update container sales status`);
      toast.error(`Error: ${error.message}`);
      throw new Error('Could not update container status.');
    }
  }
}

const bookingService = new BookingService();
export default bookingService;
