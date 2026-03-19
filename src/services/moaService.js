import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const MOA_COLLECTION = "moas";
const AUDIT_COLLECTION = "audit_logs";

export const moaService = {
  // Fetch all MOAs with optional filters
  async getMOAs(filters = {}) {
    try {
      let q = collection(db, MOA_COLLECTION);
      const constraints = [];

      if (filters.college) {
        constraints.push(where("college", "==", filters.college));
      }

      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      // Default filter for non-admins (only approved MOAs for students)
      if (filters.role === "Student") {
        const approvedStatuses = [
          "APPROVED: Signed by President",
          "APPROVED: On-going notarization",
          "APPROVED: No notarization needed"
        ];
        constraints.push(where("status", "in", approvedStatuses));
      }

      // Soft delete check
      if (!filters.showDeleted) {
        constraints.push(where("deleted", "==", false));
      }

      const moaQuery = query(q, ...constraints, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(moaQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for easier UI handling
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching MOAs:", error);
      throw error;
    }
  },

  // Save or Update MOA
  async saveMOA(moaData, userId, isEdit = false) {
    try {
      const now = serverTimestamp();
      const payload = {
        ...moaData,
        updatedAt: now,
        updatedBy: userId,
        deleted: moaData.deleted || false,
      };

      let moaId;
      if (isEdit && moaData.id) {
        moaId = moaData.id;
        const moaRef = doc(db, MOA_COLLECTION, moaId);
        await updateDoc(moaRef, payload);
        await this.logAudit(userId, "UPDATE", moaId, payload);
      } else {
        const moaRef = await addDoc(collection(db, MOA_COLLECTION), {
          ...payload,
          createdAt: now,
          createdBy: userId,
        });
        moaId = moaRef.id;
        await this.logAudit(userId, "INSERT", moaId, payload);
      }
      
      return { success: true, id: moaId };
    } catch (error) {
      console.error("Error saving MOA:", error);
      throw error;
    }
  },

  // Soft Delete MOA
  async softDeleteMOA(moaId, userId) {
    try {
      const moaRef = doc(db, MOA_COLLECTION, moaId);
      await updateDoc(moaRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: userId,
      });
      await this.logAudit(userId, "DELETE", moaId, { deleted: true });
      return { success: true };
    } catch (error) {
      console.error("Error deleting MOA:", error);
      throw error;
    }
  },

  // Audit Logging
  async logAudit(userId, operation, targetId, details) {
    try {
      await addDoc(collection(db, AUDIT_COLLECTION), {
        timestamp: serverTimestamp(),
        userId,
        operation,
        targetId,
        details: JSON.stringify(details),
      });
    } catch (error) {
      console.error("Error logging audit:", error);
    }
  },

  // Get Audit History for a specific MOA
  async getMOAAuditHistory(moaId) {
    try {
      const q = query(
        collection(db, AUDIT_COLLECTION),
        where("targetId", "==", moaId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching audit history:", error);
      throw error;
    }
  }
};
