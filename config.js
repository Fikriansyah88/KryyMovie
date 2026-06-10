/**
 * KryyMovie — Application Configuration
 * TMDB API & Firebase Configuration
 */
const CONFIG = {
  // ── TMDB API Configuration ────────────────────────────────────────────
  API_KEY: "662bb722d84aa081c497393d42407260",
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p/",
  POSTER_SIZE: "w500",
  BACKDROP_SIZE: "original",
  PROFILE_SIZE: "w185",
  LANGUAGE: "en-US",
  DEBOUNCE_DELAY: 500, // ms
  MIN_SEARCH_LENGTH: 2, // characters

  // ── Firebase Configuration ────────────────────────────────────────────
  // TODO: Replace with your Firebase project credentials
  // Get credentials from: https://console.firebase.google.com → Project Settings
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "kryymovie-XXXXX.firebaseapp.com",
    projectId: "kryymovie-XXXXX",
    storageBucket: "kryymovie-XXXXX.appspot.com",
    messagingSenderId: "XXXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXXX:web:XXXXXXXXXXXXXXXXXXXXX",
  },

  // ── Validation Rules ─────────────────────────────────────────────────
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
};
