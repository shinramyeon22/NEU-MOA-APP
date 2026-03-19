import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";

const USERS_COLLECTION = "users";

export const userService = {
  // Fetch all users for Admin
  async getAllUsers() {
    try {
      const q = query(collection(db, USERS_COLLECTION), orderBy("email", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Update user permissions or roles
  async updateUser(userId, updates) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, updates);
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
};
