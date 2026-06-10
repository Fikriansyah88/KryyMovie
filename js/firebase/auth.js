/**
 * KryyMovie — Firebase Authentication Module
 * Handles user registration, login, logout, and session management
 */

import { firebase } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = firebase;

// ── Global auth state ────────────────────────────────────────────────────
let currentUser = null;
const authObservers = [];

// ── Auth State Listener ──────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("[AUTH] User logged in:", user.uid);
    currentUser = {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split("@")[0],
      createdAt: user.metadata.creationTime,
    };
  } else {
    console.log("[AUTH] User logged out");
    currentUser = null;
  }

  // Notify all observers
  authObservers.forEach((callback) => callback(currentUser));
});

// ── Register User ────────────────────────────────────────────────────────
const registerUser = async (email, password, username) => {
  try {
    // Validate inputs
    if (!email || !password || !username) {
      throw new Error("Email, password, dan username harus diisi");
    }

    if (password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }

    if (username.length < 3) {
      throw new Error("Username minimal 3 karakter");
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: username,
    });

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      createdAt: new Date().toISOString(),
      avatar: null,
    });

    console.log("[AUTH] User registered:", user.uid);
    return { success: true, user, message: "Registrasi berhasil!" };
  } catch (err) {
    console.error("[AUTH] Registration error:", err.code, err.message);

    let message = "Registrasi gagal";
    if (err.code === "auth/email-already-in-use") {
      message = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
    } else if (err.code === "auth/weak-password") {
      message = "Password terlalu lemah. Gunakan setidaknya 6 karakter.";
    } else if (err.code === "auth/invalid-email") {
      message = "Format email tidak valid.";
    } else if (err.message) {
      message = err.message;
    }

    throw new Error(message);
  }
};

// ── Login User ───────────────────────────────────────────────────────────
const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email dan password harus diisi");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data() || {};

    console.log("[AUTH] User logged in:", user.uid);
    return { success: true, user, userData, message: "Login berhasil!" };
  } catch (err) {
    console.error("[AUTH] Login error:", err.code, err.message);

    let message = "Login gagal";
    if (err.code === "auth/user-not-found") {
      message = "Email tidak terdaftar.";
    } else if (err.code === "auth/wrong-password") {
      message = "Email atau password salah.";
    } else if (err.code === "auth/invalid-email") {
      message = "Format email tidak valid.";
    } else if (err.code === "auth/too-many-requests") {
      message = "Terlalu banyak percobaan login. Coba lagi nanti.";
    } else if (err.message) {
      message = err.message;
    }

    throw new Error(message);
  }
};

// ── Logout User ──────────────────────────────────────────────────────────
const logoutUser = async () => {
  try {
    await signOut(auth);
    currentUser = null;
    console.log("[AUTH] User logged out");
    return { success: true, message: "Logout berhasil" };
  } catch (err) {
    console.error("[AUTH] Logout error:", err);
    throw new Error("Logout gagal");
  }
};

// ── Get Current User ─────────────────────────────────────────────────────
const getCurrentUser = () => currentUser;

const getUserId = () => currentUser?.uid || null;

const isUserLoggedIn = () => !!currentUser;

// ── Observe Auth State Changes ───────────────────────────────────────────
const observeAuthState = (callback) => {
  authObservers.push(callback);
  // Immediately call with current state
  callback(currentUser);

  // Return unsubscribe function
  return () => {
    authObservers.splice(authObservers.indexOf(callback), 1);
  };
};

// ── Public API ───────────────────────────────────────────────────────────
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserId,
  isUserLoggedIn,
  observeAuthState,
};
