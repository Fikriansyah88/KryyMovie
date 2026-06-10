// ── Firebase Module Imports ─────────────────────────────────────────────
import {
  getCurrentUser,
  observeAuthState,
  logoutUser,
} from "./firebase/auth.js";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  saveReview,
  getUserReviewForMovie,
  deleteReview,
} from "./firebase/firestore.js";

const initApp = async () => {
  // ── Application State ────────────────────────────────────────────────────
  const state = {
    page: 1,
    totalPages: 1,
    activeGenreId: "",
    searchQuery: "",
    genres: [],
    currentMovieId: null, // Track active detail page ID
    currentUser: null, // Track authenticated user
  };

  let searchTimeoutId = null;

  // ── Auth State Management ────────────────────────────────────────────────
  const updateAuthUI = (user) => {
    const navLogin = document.getElementById("nav-login");
    const navProfile = document.getElementById("nav-profile");
    const navLogout = document.getElementById("nav-logout");
    const userInfo = document.getElementById("user-info");
    const usernameDisplay = document.getElementById("username-display");

    state.currentUser = user;

    if (user) {
      // User is logged in
      navLogin.style.display = "none";
      navProfile.style.display = "flex";
      navLogout.style.display = "flex";
      userInfo.style.display = "flex";
      usernameDisplay.textContent = user.username || user.email.split("@")[0];
    } else {
      // User is not logged in
      navLogin.style.display = "flex";
      navProfile.style.display = "none";
      navLogout.style.display = "none";
      userInfo.style.display = "none";
      usernameDisplay.textContent = "";
    }
  };

  // Subscribe to auth state changes
  observeAuthState((user) => {
    updateAuthUI(user);
  });

  // ── Navigation Bar UI Updates ────────────────────────────────────────────
  const updateNavigationUI = (activeRoute) => {
    const navHome = document.getElementById("nav-home");
    const navWatchlist = document.getElementById("nav-watchlist");

    if (navHome && navWatchlist) {
      navHome.classList.remove("active");
      navWatchlist.classList.remove("active");

      if (activeRoute === "home") {
        navHome.classList.add("active");
      } else if (activeRoute === "watchlist") {
        navWatchlist.classList.add("active");
      }
    }
  };

  // ── Key Validation ───────────────────────────────────────────────────────
  const validateApiKey = () => {
    if (!CONFIG.API_KEY || CONFIG.API_KEY === "YOUR_TMDB_API_KEY_HERE") {
      throw new Error(
        "TMDB API Key belum dikonfigurasi. Silakan buka file <code>config.js</code> dan isi <code>API_KEY</code> Anda.",
      );
    }
  };

  // ── Load Genres ──────────────────────────────────────────────────────────
  const loadGenres = async () => {
    if (state.genres.length > 0) return;
    try {
      validateApiKey();
      const res = await API.getGenres();
      state.genres = res.genres || [];
    } catch (err) {
      console.error("[MAIN] Gagal memuat daftar genre:", err);
      // Fallback genres locally in case of failure so layout is not empty
      state.genres = [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" },
        { id: 10752, name: "War" },
        { id: 37, name: "Western" },
      ];
    }
  };

  // ── Router Actions ───────────────────────────────────────────────────────

  const routeToHome = async () => {
    updateNavigationUI("home");
    UI.showLoader();
    state.currentMovieId = null;
    window.scrollTo(0, 0);

    try {
      validateApiKey();
      await loadGenres();

      let res;
      if (state.searchQuery) {
        res = await API.searchMovies(state.searchQuery, state.page);
      } else if (state.activeGenreId) {
        res = await API.discoverMoviesByGenre(state.activeGenreId, state.page);
      } else {
        res = await API.getPopularMovies(state.page);
      }

      state.totalPages = res.total_pages > 500 ? 500 : res.total_pages; // TMDB limits page request to 500

      UI.renderHomeView(
        res.results || [],
        state.page,
        state.totalPages,
        state.genres,
        state.activeGenreId,
        state.searchQuery,
      );
    } catch (err) {
      console.error("[MAIN] Gagal memuat film:", err);
      UI.showError(err.message, routeToHome);
    }
  };

  const routeToWatchlist = async () => {
    updateNavigationUI("watchlist");
    state.currentMovieId = null;
    window.scrollTo(0, 0);

    try {
      const currentUser = getCurrentUser();

      // Check if user is logged in
      if (!currentUser) {
        // Show empty watchlist message and redirect to login
        UI.renderWatchlistView([]);
        UI.showToast("Silakan login untuk melihat watchlist Anda", "error");
        return;
      }

      // Load watchlist from Firestore
      const watchlist = await (async () => {
        const { getWatchlist } = await import("./firebase/firestore.js");
        return getWatchlist(currentUser.uid);
      })();

      UI.renderWatchlistView(watchlist);
    } catch (err) {
      console.error("[MAIN] Gagal memuat watchlist:", err);
      UI.showError("Gagal mengambil daftar watchlist Anda.", routeToWatchlist);
    }
  };

  const routeToDetail = async (movieId) => {
    updateNavigationUI("none");
    UI.showLoader();
    state.currentMovieId = movieId;
    window.scrollTo(0, 0);

    try {
      validateApiKey();
      const [movieDetail, movieCredits] = await Promise.all([
        API.getMovieDetail(movieId),
        API.getMovieCredits(movieId),
      ]);

      const currentUser = getCurrentUser();
      const userReview = currentUser
        ? await getUserReviewForMovie(currentUser.uid, movieId)
        : null;

      UI.renderDetailView(movieDetail, movieCredits, userReview);
    } catch (err) {
      console.error("[MAIN] Gagal memuat detail film:", err);
      UI.showError(err.message, () => routeToDetail(movieId));
    }
  };

  // ── Client-side Routing Engine ───────────────────────────────────────────
  const handleRouting = () => {
    const hash = window.location.hash || "#/";

    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    if (hash === "#/" || hash === "") {
      routeToHome();
    } else if (hash === "#/watchlist") {
      routeToWatchlist();
    } else if (hash.startsWith("#/detail/")) {
      const parts = hash.split("/");
      const movieId = parts[2];
      if (movieId) {
        routeToDetail(movieId);
      } else {
        window.location.hash = "#/";
      }
    } else {
      window.location.hash = "#/";
    }
  };

  // ── Utility ──────────────────────────────────────────────────────────────
  // Decode HTML entities encoded in data attributes (e.g. &#39; → ')
  const decodeTitle = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  // ── Search Input Debouncer ───────────────────────────────────────────────
  const triggerDebouncedSearch = (query) => {
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    searchTimeoutId = setTimeout(() => {
      const cleanQuery = query.trim();

      if (cleanQuery.length >= CONFIG.MIN_SEARCH_LENGTH) {
        state.searchQuery = cleanQuery;
        state.activeGenreId = ""; // Reset genre filter when searching
        state.page = 1;
        routeToHome();
      } else {
        // Reset to popular list if the query is cleared
        if (state.searchQuery !== "") {
          state.searchQuery = "";
          state.activeGenreId = "";
          state.page = 1;
          routeToHome();
        }
      }
    }, CONFIG.DEBOUNCE_DELAY);
  };

  // ── Global Event Delegation ──────────────────────────────────────────────
  document.addEventListener("click", async (e) => {
    // 1. Navigation Home / Logo Clicks (resets filter & search if already on Home)
    const logoLink = e.target.closest(".logo");
    const homeNavLink = e.target.closest("#nav-home");
    if (logoLink || homeNavLink) {
      const hash = window.location.hash;
      if (hash === "#/" || hash === "") {
        e.preventDefault();
        if (
          state.searchQuery !== "" ||
          state.activeGenreId !== "" ||
          state.page !== 1
        ) {
          state.searchQuery = "";
          state.activeGenreId = "";
          state.page = 1;
          routeToHome();
        }
      }
      return;
    }

    // 2. Watchlist Button Click (from card or details page)
    const watchlistBtn =
      e.target.closest(".watchlist-toggle-btn") ||
      e.target.closest("#detail-watchlist-btn");
    if (watchlistBtn) {
      e.preventDefault();

      // Check if user is logged in
      const user = getCurrentUser();
      if (!user) {
        UI.showToast("Silakan login untuk menambahkan ke watchlist", "error");
        window.location.href = "pages/auth.html";
        return;
      }

      try {
        const movieData = JSON.parse(
          watchlistBtn.getAttribute("data-movie-data"),
        );

        // Check if already in watchlist
        const inWatchlist = await isInWatchlist(user.uid, movieData.id);

        if (inWatchlist) {
          // Remove from watchlist
          await removeFromWatchlist(user.uid, movieData.id);
          UI.showToast(`"${movieData.title}" dihapus dari Watchlist.`, "error");
        } else {
          // Add to watchlist
          await addToWatchlist(user.uid, movieData);
          UI.showToast(
            `"${movieData.title}" ditambahkan ke Watchlist!`,
            "success",
          );
        }

        // Live update watchlist view if active
        if (window.location.hash === "#/watchlist") {
          await routeToWatchlist();
        } else if (window.location.hash.startsWith("#/detail/")) {
          const isNowInWatchlist = await isInWatchlist(user.uid, movieData.id);
          watchlistBtn.className = `btn-watchlist-detail ${isNowInWatchlist ? "added" : "not-added"}`;
          watchlistBtn.querySelector("span").textContent = isNowInWatchlist
            ? "Di Watchlist"
            : "Tambah ke Watchlist";
          watchlistBtn
            .querySelector("svg")
            .setAttribute("fill", isNowInWatchlist ? "currentColor" : "none");
        } else {
          const isNowInWatchlist = await isInWatchlist(user.uid, movieData.id);
          watchlistBtn.classList.toggle("in-watchlist", isNowInWatchlist);
          watchlistBtn
            .querySelector("svg")
            .setAttribute("fill", isNowInWatchlist ? "currentColor" : "none");
        }
      } catch (err) {
        console.error("[MAIN] Gagal memperbarui watchlist:", err);
        UI.showToast("Gagal memperbarui watchlist", "error");
      }
      return;
    }

    // 3. Genre Chip Click
    const genreChip = e.target.closest(".genre-chip");
    if (genreChip) {
      e.preventDefault();
      const genreId = genreChip.getAttribute("data-genre-id");
      state.activeGenreId = genreId;
      state.searchQuery = ""; // Reset search query
      state.page = 1;

      const chips = document.querySelectorAll(".genre-chip");
      chips.forEach((c) => c.classList.remove("active"));
      genreChip.classList.add("active");

      routeToHome();
      return;
    }

    // 4. Pagination Buttons
    const prevBtn = e.target.closest("#prev-page-btn");
    if (prevBtn) {
      e.preventDefault();
      if (state.page > 1) {
        state.page--;
        routeToHome();
      }
      return;
    }

    const nextBtn = e.target.closest("#next-page-btn");
    if (nextBtn) {
      e.preventDefault();
      if (state.page < state.totalPages) {
        state.page++;
        routeToHome();
      }
      return;
    }

    // 5. Submit Review Button
    const submitReviewBtn = e.target.closest("#btn-submit-review");
    if (submitReviewBtn) {
      e.preventDefault();

      const user = getCurrentUser();
      if (!user) {
        UI.showToast("Silakan login untuk menambahkan review", "error");
        window.location.href = "pages/auth.html";
        return;
      }

      const selector = document.getElementById("stars-selector");
      const textarea = document.getElementById("review-textarea");

      if (!selector || !state.currentMovieId) return;

      const rating = parseInt(selector.getAttribute("data-rating") || "0", 10);
      const reviewText = textarea ? textarea.value : "";

      if (rating === 0) {
        UI.showToast(
          "Harap berikan penilaian bintang sebelum menyimpan.",
          "error",
        );
        return;
      }

      try {
        submitReviewBtn.disabled = true;
        await saveReview(
          user.uid,
          user.username || user.email.split("@")[0],
          state.currentMovieId,
          rating,
          reviewText,
        );
        UI.showToast("Ulasan Anda berhasil disimpan!", "success");
        await routeToDetail(state.currentMovieId);
      } catch (err) {
        console.error("[MAIN] Gagal menyimpan ulasan:", err);
        UI.showToast(err.message || "Gagal menyimpan ulasan Anda.", "error");
        submitReviewBtn.disabled = false;
      }
      return;
    }

    // 6. Delete Review Button
    const deleteReviewBtn = e.target.closest("#btn-delete-review");
    if (deleteReviewBtn) {
      e.preventDefault();

      const user = getCurrentUser();
      if (!user || !state.currentMovieId) return;

      try {
        deleteReviewBtn.disabled = true;
        await deleteReview(user.uid, state.currentMovieId);
        UI.showToast("Ulasan Anda telah dihapus.", "success");
        await routeToDetail(state.currentMovieId);
      } catch (err) {
        console.error("[MAIN] Gagal menghapus ulasan:", err);
        UI.showToast("Gagal menghapus ulasan Anda.", "error");
        deleteReviewBtn.disabled = false;
      }
      return;
    }

    // 7. Interactive Star Click Delegation
    const star = e.target.closest(".star-input");
    if (star) {
      e.preventDefault();
      const container = star.closest("#stars-selector");
      if (container) {
        const val = parseInt(star.getAttribute("data-value"), 10);
        container.setAttribute("data-rating", val);

        const stars = container.querySelectorAll(".star-input");
        stars.forEach((s) => {
          const sVal = parseInt(s.getAttribute("data-value"), 10);
          s.classList.toggle("active", sVal <= val);
        });

        const submitBtn = document.getElementById("btn-submit-review");
        if (submitBtn) submitBtn.disabled = false;
      }
      return;
    }
  });

  // ── Global Input Delegation ──────────────────────────────────────────────
  document.addEventListener("input", (e) => {
    // 1. Search Box
    if (e.target.id === "search-input") {
      triggerDebouncedSearch(e.target.value);
    }

    // 2. Review Textarea Character Counter
    if (e.target.id === "review-textarea") {
      const counter = document.getElementById("char-counter");
      if (counter) {
        counter.textContent = `${e.target.value.length}/500`;
      }
    }
  });

  // ── Star Hover Preview Delegation ────────────────────────────────────────
  document.addEventListener("mouseover", (e) => {
    const star = e.target.closest(".star-input");
    if (star) {
      const container = star.closest("#stars-selector");
      if (container) {
        const val = parseInt(star.getAttribute("data-value"), 10);
        const stars = container.querySelectorAll(".star-input");
        stars.forEach((s) => {
          const sVal = parseInt(s.getAttribute("data-value"), 10);
          s.style.color =
            sVal <= val ? "var(--accent-gold)" : "var(--text-muted)";
        });
      }
    }
  });

  document.addEventListener("mouseout", (e) => {
    const star = e.target.closest(".star-input");
    if (star) {
      const container = star.closest("#stars-selector");
      if (container) {
        const related = e.relatedTarget;
        if (!related || !related.closest(".star-input")) {
          const stars = container.querySelectorAll(".star-input");
          stars.forEach((s) => {
            s.style.color = ""; // reset to class-based CSS styling (.active)
          });
        }
      }
    }
  });

  // Run routing on initial load and whenever hash changes
  handleRouting();
  window.addEventListener("hashchange", handleRouting);

  // ── Logout Button Handler ────────────────────────────────────────────────
  const logoutBtn = document.getElementById("nav-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await logoutUser();
        window.location.href = "index.html#/";
      } catch (err) {
        console.error("[MAIN] Logout error:", err);
        UI.showToast("Gagal logout", "error");
      }
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
  initApp();
}
