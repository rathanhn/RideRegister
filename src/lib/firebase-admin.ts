
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount: ServiceAccount = {
        "type": "service_account",
        "projectId": "rideregister",
        "privateKeyId": "d12c85e59265691238622c813f3d79a518e9514e",
        "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmQ/9u3sFm24Gq\n2Q8i1zB90mN2l7c/E9l5a2w8a4f8H6D/Z5f6w8c5b3s4a3n5m7H/z3a7b8e1f5g3i\n7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m\n4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c\n8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\n2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h\n6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k\n0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m\n4n6c8b0a2g4h6j8k0l2m4n6c8b0AgMBAAECggEBAJ2q\nB8g4d6f8g2h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b\n0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g\n4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j\n8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l\n2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBANl/Z5f6w8c5b3\ns4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h\n9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2\nm4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBANl/Z5f6w8c5b3\ns4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g7h\n9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2\nm4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n\n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z5f6w8c5b\n3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c3b5g\n7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k\n0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l\n2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z5f6w\n8c5b3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m9n1c\n3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h\n6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j\n8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0AoGBAKl/Z\n5f6w8c5b3s4a3n5m7H/z3a7b8e1f5g3i7k8e3b5g6h9k5c8d4f9g3h1j5k7l8m\n9n1c3b5g7h9k2l4m6n8c0b2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\n2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g\n4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a2g4h6j8k0l2m4n6c8b0a\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
        "clientEmail": "firebase-adminsdk-q5j1j@rideregister.iam.gserviceaccount.com",
        "clientId": "109268672049924083321",
        "authUri": "https://accounts.google.com/o/oauth2/auth",
        "tokenUri": "https://oauth2.googleapis.com/token",
        "authProviderX509CertUrl": "https://www.googleapis.com/oauth2/v1/certs",
        "clientX509CertUrl": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q5j1j%40rideregister.iam.gserviceaccount.com",
        "universeDomain": "googleapis.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://rideregister.firebaseio.com`,
    });
  } catch (error) {
    console.error('Error parsing or initializing Firebase Admin SDK:', error);
    // Throw a more specific error to help with debugging
    throw new Error('Firebase Admin SDK initialization failed. The service account key may be malformed or initialization failed.');
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
