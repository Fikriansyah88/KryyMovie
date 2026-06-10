/**
 * KryyMovie — Firebase Initialization Module
 * Initializes Firebase SDK and exports instances for auth & firestore
 */

// Import Firebase modules via CDN
const firebaseConfig = {
  apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "kryymovie-XXXXX.firebaseapp.com",
  projectId: "kryymovie-XXXXX",
  storageBucket: "kryymovie-XXXXX.appspot.com",
  messagingSenderId: "XXXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXXX:web:XXXXXXXXXXXXXXXXXXXXX",
};

// Note: Replace above credentials with your actual Firebase project config
// Visit: https://console.firebase.google.com → Project Settings → Your apps

let auth, db;

// Initialize Firebase using dynamic imports
async function initializeFirebase() {
  try {
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js");
    const { getAuth } =
      await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js");
    const { getFirestore } =
      await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    console.log("[Firebase] Initialized successfully");
    return { auth, db, app };
  } catch (err) {
    console.error("[Firebase] Initialization failed:", err);
    throw err;
  }
}

// Export initialization function
export { initializeFirebase, firebaseConfig };

// Initialize on load
export const firebase = await initializeFirebase();
