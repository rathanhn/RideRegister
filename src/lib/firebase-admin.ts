// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';

// Since process.env isn't working reliably, we will define the key directly.
// This is NOT recommended for production but will work here.
const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (!serviceAccountKeyString) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKeyString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Error parsing or initializing Firebase Admin SDK:', error);
    throw new Error('Firebase Admin SDK initialization failed. The service account key may be malformed or initialization failed.');
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
