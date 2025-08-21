// src/services/containerService.js
import { db } from '../config/firebase.js';
import app from "../config/firebase.js";
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';

export class ContainerService {

  /**
   * Fetches containers from Firestore in real-time based on a set of filters.
   * @param {object} filters - An object containing filter criteria.
   * @param {function} callback - The function to call with the updated data.
   * @returns {function} - An unsubscribe function to stop listening to updates.
   */
  getContainers(filters, callback) {
    try {
      // Base query for the 'containers' collection
      let q = query(collection(db, 'containers'));

      // Dynamically add 'where' clauses based on the filters object
      // This is a simplified example. Complex queries might require composite indexes in Firestore.
    //   if (filters.status && filters.status !== 'All') {
    //     q = query(q, where('status', '==', filters.status));
    //   }
      if (filters.sales_status && filters.sales_status !== 'All') {
        q = query(q, where('sales_status', '==', filters.sales_status));
      }
    //   if (filters.model && filters.model !== 'All') {
    //     q = query(q, where('model', '==', filters.model));
    //   }
      // Add more filters for PORT, Company, etc. as needed

      // onSnapshot listens for real-time updates
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const containers = [];
        querySnapshot.forEach((doc) => {
          containers.push({ id: doc.id, ...doc.data() });
        });
        callback(containers); // Send the updated list to the component
      }
      ,
        (error) => {
            console.error("Firestore onSnapshot error:", error);
        }
        );

      return unsubscribe; // Return the function to clean up the listener

    } catch (error) {
      console.error("Error fetching containers:", error);
      throw error;
    }
  }
}

const containerService = new ContainerService();
export default containerService;
