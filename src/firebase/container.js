// src/services/containerService.js
import { db } from '../config/firebase.js';
import app from "../config/firebase.js";
import { collection, query, where, onSnapshot, getFirestore, getDocs } from 'firebase/firestore';
import {convertTimestamps} from '../assets/helperFunctions.js'



export class ContainerService {

  async getAllContainers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'containers'));
      const containers = [];
      querySnapshot.forEach((doc) => {
        containers.push({ id: doc.id, ...convertTimestamps(doc.data()) });
      });
      return containers;
    } catch (error) {
      console.error("Error fetching all containers:", error);
      throw error;
    }
  }

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
  async getContainerById(containerId) {
    try {
      const docRef = doc(db, 'containers', containerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("No such container found!");
      }
    } catch (error) {
      console.error("Error fetching container by ID:", error);
      throw error;
    }
  }
}

const containerService = new ContainerService();
export default containerService;
