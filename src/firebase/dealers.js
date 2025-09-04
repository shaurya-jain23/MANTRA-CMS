import { db } from '../config/firebase.js';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

class DealerService {
  // Add a new dealer, linking them to the user who registered them
  async addDealer(dealerData, user) {
    try {
      const docRef = await addDoc(collection(db, 'dealers'), {
        ...dealerData,
        district: dealerData.district.toUpperCase(),
        state: dealerData.state.toUpperCase(),
        trade_name: dealerData.trade_name.toUpperCase(),
        registered_by_id: user.uid,
        registered_by_name: user.displayName,
        status: 'Active', // Default status
        created_at: serverTimestamp(),
      });
      return { id: docRef.id, ...dealerData };
    } catch (error) {
      console.error("Error adding dealer:", error);
      throw new Error("Could not add new dealer.");
    }
  }

  // Update an existing dealer's information or status
  async updateDealer(dealerId, dealerData) {
    try {
      const dealerRef = doc(db, 'dealers', dealerId);
      await updateDoc(dealerRef, dealerData);
    } catch (error) {
      console.error("Error updating dealer:", error);
      throw new Error("Could not update dealer.");
    }
  }

  // Fetch all dealers (for Admin/Superuser)
  async getAllDealers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'dealers'));
      const dealers = [];
      querySnapshot.forEach((doc) => {
        dealers.push({ id: doc.id, ...doc.data() });
      });
      return dealers;
    } catch (error) {
      console.error("Error fetching all dealers:", error);
      throw new Error("Could not fetch dealers.");
    }
  }

  // Fetch only the dealers registered by a specific salesperson
  async getDealersBySalesperson(userId) {
    try {
      const q = query(collection(db, 'dealers'), where('registered_by_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const dealers = [];
      querySnapshot.forEach((doc) => {
        dealers.push({ id: doc.id, ...doc.data() });
      });
      return dealers;
    } catch (error) {
      console.error("Error fetching salesperson's dealers:", error);
      throw new Error("Could not fetch dealers.");
    }
  }
  async getDealerById(dealerId) {
    try {
      const docRef = doc(db, "dealers", dealerId);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    } catch (error) {
      console.error("Error fetching dealer:", error);
      throw new Error("Could not fetch dealers.");
    }
  }
}

const dealerService = new DealerService();
export default dealerService;

