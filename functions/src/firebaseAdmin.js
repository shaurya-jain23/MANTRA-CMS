// firebaseAdmin.js
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Ensure app is only initialized once
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
