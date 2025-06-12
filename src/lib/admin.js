import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const checkAdminStatus = async (userId) => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", userId));
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const setAdminStatus = async (userId, isAdmin) => {
  try {
    if (isAdmin) {
      await setDoc(doc(db, "admins", userId), {
        isAdmin: true,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(doc(db, "admins", userId), {
        isAdmin: false,
        updatedAt: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error("Error setting admin status:", error);
    return false;
  }
}; 