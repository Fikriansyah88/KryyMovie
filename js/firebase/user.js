/**
 * KryyMovie — User State Management Module
 * Global user state & observer pattern for reactive updates
 */

import { observeAuthState, getCurrentUser } from "./auth.js";

// ── Global User State ────────────────────────────────────────────────────
let globalUser = null;
const userObservers = [];

// ── Subscribe to Auth Changes ────────────────────────────────────────────
observeAuthState((user) => {
  globalUser = user;

  // Notify all UI observers
  userObservers.forEach((callback) => {
    try {
      callback(user);
    } catch (err) {
      console.error("[USER] Observer callback error:", err);
    }
  });
});

// ── Subscribe to User State Changes ──────────────────────────────────────
const subscribeToUserState = (callback) => {
  userObservers.push(callback);
  // Immediately call with current state
  callback(globalUser);

  // Return unsubscribe function
  return () => {
    userObservers.splice(userObservers.indexOf(callback), 1);
  };
};

// ── Get User Info ────────────────────────────────────────────────────────
const getUser = () => globalUser;

const getUserId = () => globalUser?.uid || null;

const getUsername = () => globalUser?.username || null;

const getEmail = () => globalUser?.email || null;

const isLoggedIn = () => !!globalUser;

// ── Public API ───────────────────────────────────────────────────────────
export {
  subscribeToUserState,
  getUser,
  getUserId,
  getUsername,
  getEmail,
  isLoggedIn,
};
