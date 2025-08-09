// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let app: admin.app.App;

function getFirebaseAdmin() {
  if (app) {
    return {
      db: admin.firestore(app),
      auth: admin.auth(app),
      admin,
    };
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey);

    if (admin.apps.length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    } else {
      app = admin.app();
    }
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    throw new Error('Firebase Admin SDK initialization failed. The service account key may be malformed.');
  }

  return {
    db: admin.firestore(app),
    auth: admin.auth(app),
    admin,
  };
}

const { db, auth, admin } = getFirebaseAdmin();

export { db, auth, admin };