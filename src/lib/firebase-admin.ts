
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let app: admin.app.App;

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }

    try {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('Firebase Admin SDK initialization failed. The service account key may be malformed.');
    }
  } else {
    app = admin.app();
  }
  
  const db = admin.firestore(app);
  const auth = admin.auth(app);

  return { db, auth };
}

const { db, auth } = initializeFirebaseAdmin();
export { db, auth, admin };
