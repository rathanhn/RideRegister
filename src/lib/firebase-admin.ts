
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is NOT recommended for production. We are hardcoding the key
// because process.env is not being populated in this environment.
const serviceAccountKeyString = '{"type":"service_account","project_id":"rideregister","private_key_id":"d12c85e59265691238622c813f3d79a518e9514e","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmQ/9u3sFm24Gq\\n2Q8i1zB90mN2l7c/E9l5a2w8a4f8H6D/Z5f6w8c5b3s4a3n5m7H/z3a7b8e1f5g3i\\n7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m\\n4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c\\n8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\\n2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h\\n6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k\\n0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m\\n4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AgMBAAECggEBAJ2q\\nB8g4d6f8g2h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b\\n0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g\\n4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j\\n8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l\\n2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\\n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBANl/Z5f6w8c5b3\\ns4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h\\n9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2\\nm4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\\n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBANl/Z5f6w8c5b3\\ns4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h\\n9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2\\nm4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\\n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z5f6w8c5b\\n3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g\\n7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k\\n0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l\\n2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z5f6w\\n8c5b3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c\\n3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h\\n6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j\\n8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z\\n5f6w8c5b3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m\\n9n1c3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\\n2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g\\n4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-q5j1j@rideregister.iam.gserviceaccount.com","client_id":"109268672049924083321","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q5j1j%40rideregister.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'

if (!admin.apps.length) {
  if (!serviceAccountKeyString) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKeyString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://rideregister.firebaseio.com`,
    });
  } catch (error) {
    console.error('Error parsing or initializing Firebase Admin SDK:', error);
    throw new Error('Firebase Admin SDK initialization failed. The service account key may be malformed or initialization failed.');
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
