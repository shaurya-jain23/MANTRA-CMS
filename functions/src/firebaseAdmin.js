// firebaseAdmin.js
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Ensure app is only initialized once
initializeApp();

export const db = getFirestore();
