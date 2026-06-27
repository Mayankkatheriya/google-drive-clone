import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "./firebaseAdmin";

export function getAdminFirestore() {
  getFirebaseAdminApp();
  return getFirestore();
}
