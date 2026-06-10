/**
 * KryyMovie — Firestore Database Module
 * Handles watchlist and review CRUD operations
 */

import { firebase } from "./firebase-init.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = firebase;

// ── WATCHLIST OPERATIONS ─────────────────────────────────────────────────

/**
 * Add movie to user's watchlist
 */
const addToWatchlist = async (userId, movieData) => {
  try {
    if (!userId || !movieData?.id) {
      throw new Error("userId dan movieData harus valid");
    }

    const watchlistRef = doc(db, `watchlists/${userId}/movies/${movieData.id}`);

    await setDoc(watchlistRef, {
      id: movieData.id,
      title: movieData.title,
      poster_path: movieData.poster_path || null,
      release_date: movieData.release_date || "",
      vote_average: movieData.vote_average || 0,
      addedAt: serverTimestamp(),
    });

    console.log(`[FIRESTORE] Added to watchlist: ${movieData.title}`);
    return {
      success: true,
      message: `"${movieData.title}" ditambahkan ke Watchlist!`,
    };
  } catch (err) {
    console.error("[FIRESTORE] Add to watchlist error:", err);
    throw new Error("Gagal menambahkan ke watchlist");
  }
};

/**
 * Remove movie from user's watchlist
 */
const removeFromWatchlist = async (userId, movieId) => {
  try {
    if (!userId || !movieId) {
      throw new Error("userId dan movieId harus valid");
    }

    await deleteDoc(doc(db, `watchlists/${userId}/movies/${movieId}`));
    console.log(`[FIRESTORE] Removed from watchlist: ${movieId}`);
    return { success: true, message: "Dihapus dari Watchlist" };
  } catch (err) {
    console.error("[FIRESTORE] Remove from watchlist error:", err);
    throw new Error("Gagal menghapus dari watchlist");
  }
};

/**
 * Get user's watchlist
 */
const getWatchlist = async (userId) => {
  try {
    if (!userId) throw new Error("userId harus valid");

    const watchlistRef = collection(db, `watchlists/${userId}/movies`);
    const snapshot = await getDocs(watchlistRef);

    const movies = [];
    snapshot.forEach((doc) => {
      movies.push({
        ...doc.data(),
        docId: doc.id,
      });
    });

    console.log(`[FIRESTORE] Loaded ${movies.length} watchlist items`);
    return movies;
  } catch (err) {
    console.error("[FIRESTORE] Get watchlist error:", err);
    return [];
  }
};

/**
 * Check if movie is in user's watchlist
 */
const isInWatchlist = async (userId, movieId) => {
  try {
    if (!userId || !movieId) return false;

    const docRef = doc(db, `watchlists/${userId}/movies/${movieId}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (err) {
    console.error("[FIRESTORE] Check watchlist error:", err);
    return false;
  }
};

/**
 * Subscribe to real-time watchlist updates
 */
const subscribeToWatchlist = (userId, callback) => {
  try {
    if (!userId) return () => {};

    const watchlistRef = collection(db, `watchlists/${userId}/movies`);
    const unsubscribe = onSnapshot(watchlistRef, (snapshot) => {
      const movies = [];
      snapshot.forEach((doc) => {
        movies.push({ ...doc.data(), docId: doc.id });
      });
      callback(movies);
    });

    return unsubscribe;
  } catch (err) {
    console.error("[FIRESTORE] Subscribe watchlist error:", err);
    return () => {};
  }
};

// ── REVIEW OPERATIONS ────────────────────────────────────────────────────

/**
 * Save or update a review
 */
const saveReview = async (userId, username, movieId, rating, comment) => {
  try {
    if (!userId || !movieId || !rating) {
      throw new Error("userId, movieId, dan rating harus valid");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating harus antara 1-5");
    }

    if (comment.length > 500) {
      throw new Error("Komentar maksimal 500 karakter");
    }

    // Use userId-movieId as document ID for uniqueness
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, "reviews", reviewId);

    // Check if review already exists
    const existingReview = await getDoc(reviewRef);
    const isUpdate = existingReview.exists();

    await setDoc(
      reviewRef,
      {
        userId: userId,
        username: username,
        movieId: movieId,
        rating: rating,
        comment: comment.trim(),
        createdAt: isUpdate
          ? existingReview.data().createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: false },
    );

    const action = isUpdate ? "diperbarui" : "ditambahkan";
    console.log(`[FIRESTORE] Review ${action}: ${reviewId}`);
    return {
      success: true,
      message: `Ulasan Anda berhasil ${action}!`,
      reviewId,
    };
  } catch (err) {
    console.error("[FIRESTORE] Save review error:", err);
    throw new Error(err.message || "Gagal menyimpan ulasan");
  }
};

/**
 * Get all reviews for a movie
 */
const getReviews = async (movieId) => {
  try {
    if (!movieId) return [];

    const q = query(
      collection(db, "reviews"),
      where("movieId", "==", movieId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const reviews = [];

    snapshot.forEach((doc) => {
      reviews.push({
        ...doc.data(),
        reviewId: doc.id,
      });
    });

    console.log(
      `[FIRESTORE] Loaded ${reviews.length} reviews for movie ${movieId}`,
    );
    return reviews;
  } catch (err) {
    console.error("[FIRESTORE] Get reviews error:", err);
    return [];
  }
};

/**
 * Get user's own review for a specific movie
 */
const getUserReviewForMovie = async (userId, movieId) => {
  try {
    if (!userId || !movieId) return null;

    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, "reviews", reviewId);
    const snapshot = await getDoc(reviewRef);

    if (snapshot.exists()) {
      return {
        ...snapshot.data(),
        reviewId: snapshot.id,
      };
    }

    return null;
  } catch (err) {
    console.error("[FIRESTORE] Get user review error:", err);
    return null;
  }
};

/**
 * Get all reviews by a user
 */
const getUserReviews = async (userId) => {
  try {
    if (!userId) return [];

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const reviews = [];

    snapshot.forEach((doc) => {
      reviews.push({
        ...doc.data(),
        reviewId: doc.id,
      });
    });

    console.log(
      `[FIRESTORE] Loaded ${reviews.length} reviews for user ${userId}`,
    );
    return reviews;
  } catch (err) {
    console.error("[FIRESTORE] Get user reviews error:", err);
    return [];
  }
};

/**
 * Delete a review (only owner can delete)
 */
const deleteReview = async (userId, movieId) => {
  try {
    if (!userId || !movieId) {
      throw new Error("userId dan movieId harus valid");
    }

    const reviewId = `${userId}_${movieId}`;
    await deleteDoc(doc(db, "reviews", reviewId));

    console.log(`[FIRESTORE] Deleted review: ${reviewId}`);
    return { success: true, message: "Ulasan berhasil dihapus" };
  } catch (err) {
    console.error("[FIRESTORE] Delete review error:", err);
    throw new Error("Gagal menghapus ulasan");
  }
};

/**
 * Subscribe to real-time reviews for a movie
 */
const subscribeToMovieReviews = (movieId, callback) => {
  try {
    if (!movieId) return () => {};

    const q = query(
      collection(db, "reviews"),
      where("movieId", "==", movieId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({ ...doc.data(), reviewId: doc.id });
      });
      callback(reviews);
    });

    return unsubscribe;
  } catch (err) {
    console.error("[FIRESTORE] Subscribe to reviews error:", err);
    return () => {};
  }
};

// ── Public API ───────────────────────────────────────────────────────────
export {
  // Watchlist
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isInWatchlist,
  subscribeToWatchlist,

  // Reviews
  saveReview,
  getReviews,
  getUserReviewForMovie,
  getUserReviews,
  deleteReview,
  subscribeToMovieReviews,
};
