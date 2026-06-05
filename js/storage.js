const STORAGE = (() => {
  const WATCHLIST_KEY = "kryymovie_watchlist";
  const RATINGS_KEY = "kryymovie_ratings";

  // ── Helpers ──────────────────────────────────────────────────────────────

  const safeGet = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[STORAGE] Failed to save "${key}":`, e);
      return false;
    }
  };

  // ── Watchlist ─────────────────────────────────────────────────────────────

  const getWatchlist = () => safeGet(WATCHLIST_KEY, []);

  const isInWatchlist = (movieId) =>
    getWatchlist().some((m) => m.id === movieId);

  const addToWatchlist = (movie) => {
    const list = getWatchlist();
    if (!isInWatchlist(movie.id)) {
      list.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || "",
        vote_average: movie.vote_average || 0,
      });
      safeSet(WATCHLIST_KEY, list);
    }
  };

  const removeFromWatchlist = (movieId) => {
    safeSet(
      WATCHLIST_KEY,
      getWatchlist().filter((m) => m.id !== movieId),
    );
  };

  /**
   * Toggle a movie in the watchlist.
   * @returns {boolean} true if added, false if removed
   */
  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
      return false;
    }
    addToWatchlist(movie);
    return true;
  };

  // ── Ratings & Reviews ────────────────────────────────────────────────────

  /** Returns all ratings as { [movieId]: { rating, review, updatedAt } } */
  const getAllRatings = () => safeGet(RATINGS_KEY, {});

  /** Get a single movie rating object or null */
  const getRating = (movieId) => getAllRatings()[String(movieId)] ?? null;

  /** Save (or update) a rating + review for a movie */
  const saveRating = (movieId, rating, review = "") => {
    const ratings = getAllRatings();
    ratings[String(movieId)] = {
      rating,
      review: review.trim(),
      updatedAt: new Date().toISOString(),
    };
    safeSet(RATINGS_KEY, ratings);
  };

  /** Delete a rating/review for a movie */
  const deleteRating = (movieId) => {
    const ratings = getAllRatings();
    delete ratings[String(movieId)];
    safeSet(RATINGS_KEY, ratings);
  };

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    getWatchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    getRating,
    saveRating,
    deleteRating,
  };
})();
