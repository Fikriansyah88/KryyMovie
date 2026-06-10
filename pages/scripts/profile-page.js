/**
 * KryyMovie — Profile Page Script
 * Handles profile display, stats loading, and logout
 */

import {
  logoutUser,
  getCurrentUser,
  observeAuthState,
} from "../../js/firebase/auth.js";
import { getWatchlist, getUserReviews } from "../../js/firebase/firestore.js";

// ── DOM Elements ─────────────────────────────────────────────────────────
const profileLoading = document.getElementById("profile-loading");
const profileNotLoggedIn = document.getElementById("profile-not-logged-in");
const profileContent = document.getElementById("profile-content");
const logoutBtn = document.getElementById("logout-btn");
const confirmLogoutBtn = document.getElementById("confirm-logout");
const cancelLogoutBtn = document.getElementById("cancel-logout");
const logoutModal = document.getElementById("logout-modal");
const viewReviewsBtn = document.getElementById("view-reviews-btn");

// Profile info elements
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileJoinDate = document.getElementById("profile-join-date");
const watchlistCount = document.getElementById("watchlist-count");
const reviewCount = document.getElementById("review-count");

// ── Utility Functions ────────────────────────────────────────────────────

/**
 * Show loading state
 */
const showLoading = () => {
  profileLoading.style.display = "flex";
  profileNotLoggedIn.style.display = "none";
  profileContent.style.display = "none";
};

/**
 * Show not logged in state
 */
const showNotLoggedIn = () => {
  profileLoading.style.display = "none";
  profileNotLoggedIn.style.display = "flex";
  profileContent.style.display = "none";
};

/**
 * Show profile content
 */
const showProfile = () => {
  profileLoading.style.display = "none";
  profileNotLoggedIn.style.display = "none";
  profileContent.style.display = "block";
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

/**
 * Load user profile data
 */
const loadProfileData = async (user) => {
  try {
    if (!user) {
      showNotLoggedIn();
      return;
    }

    showLoading();

    // Set user info
    profileUsername.textContent = user.username || user.email.split("@")[0];
    profileEmail.textContent = user.email;
    profileJoinDate.textContent = `Bergabung: ${formatDate(user.createdAt)}`;

    // Load watchlist count
    try {
      const watchlist = await getWatchlist(user.uid);
      watchlistCount.textContent = watchlist.length;
    } catch (err) {
      console.error("[PROFILE] Failed to load watchlist:", err);
      watchlistCount.textContent = "0";
    }

    // Load review count
    try {
      const reviews = await getUserReviews(user.uid);
      reviewCount.textContent = reviews.length;
    } catch (err) {
      console.error("[PROFILE] Failed to load reviews:", err);
      reviewCount.textContent = "0";
    }

    // Show profile
    showProfile();
  } catch (err) {
    console.error("[PROFILE] Error loading profile:", err);
    showNotLoggedIn();
  }
};

/**
 * Show logout modal
 */
const showLogoutModal = () => {
  logoutModal.style.display = "flex";
};

/**
 * Hide logout modal
 */
const hideLogoutModal = () => {
  logoutModal.style.display = "none";
};

/**
 * Perform logout
 */
const performLogout = async () => {
  try {
    logoutBtn.disabled = true;
    const result = await logoutUser();

    console.log("[PROFILE] Logout successful");

    // Redirect to home
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 500);
  } catch (err) {
    console.error("[PROFILE] Logout error:", err);
    alert("Gagal logout. Silakan coba lagi.");
    logoutBtn.disabled = false;
  }
};

// ── Event Listeners ─────────────────────────────────────────────────────

/**
 * Logout button
 */
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  showLogoutModal();
});

/**
 * Confirm logout
 */
confirmLogoutBtn.addEventListener("click", async () => {
  hideLogoutModal();
  await performLogout();
});

/**
 * Cancel logout
 */
cancelLogoutBtn.addEventListener("click", () => {
  hideLogoutModal();
});

/**
 * View reviews button
 */
viewReviewsBtn.addEventListener("click", () => {
  // TODO: Implement reviews view (can be a modal or separate section)
  alert(
    "Fitur ini akan segera hadir! Saat ini Anda dapat melihat ulasan Anda dari halaman film.",
  );
});

// ── Auth State Observer ──────────────────────────────────────────────────

/**
 * Subscribe to auth state changes
 */
observeAuthState((user) => {
  loadProfileData(user);
});

console.log("[PROFILE PAGE] Script loaded");
