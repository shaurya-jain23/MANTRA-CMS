// src/services/containerService.js
import { db } from '../config/firebase.js';
import app from "../config/firebase.js";
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';

export class ContainerService {

  getContainers(filters, callback) {
    try {
      // Base query for the 'containers' collection
      let q = query(collection(db, 'containers'));

      if (filters.sales_status && filters.sales_status !== 'All') {
        q = query(q, where('sales_status', '==', filters.sales_status));
      }
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const containers = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          for (const key in data) {
            if (data[key] && typeof data[key].toDate === 'function') {
              data[key] = data[key].toDate();
            }
          }
          containers.push({ id: doc.id, ...doc.data() });
        });
        callback(containers); // Send the updated list to the component
      }
      ,
        (error) => {
            console.error("Firestore onSnapshot error:", error);
        }
        );

      return unsubscribe; 

    } catch (error) {
      console.error("Error fetching containers:", error);
      throw error;
    }
  }
}

const containerService = new ContainerService();
export default containerService;
