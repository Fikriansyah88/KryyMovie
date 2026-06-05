const API = (() => {
  /**
   * Core fetch wrapper for TMDB endpoints.
   * @param {string} endpoint - API path (e.g. '/movie/popular')
   * @param {Object} params   - Additional query params
   * @returns {Promise<Object>}
   */
  const fetchFromTMDB = async (endpoint, params = {}) => {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", CONFIG.API_KEY);
    url.searchParams.set("language", CONFIG.LANGUAGE);

    Object.entries(params).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        url.searchParams.set(String(key), String(val));
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.status_message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  };

  return {
    /** Fetch popular movies list */
    getPopularMovies: (page = 1) => fetchFromTMDB("/movie/popular", { page }),

    /** Search movies by title query */
    searchMovies: (query, page = 1) =>
      fetchFromTMDB("/search/movie", { query, page, include_adult: false }),

    /** Fetch full detail for a single movie */
    getMovieDetail: (id) => fetchFromTMDB(`/movie/${id}`),

    /** Fetch cast & crew for a movie */
    getMovieCredits: (id) => fetchFromTMDB(`/movie/${id}/credits`),

    /** Fetch all available movie genre list */
    getGenres: () => fetchFromTMDB("/genre/movie/list"),

    /** Discover movies filtered by genre, sorted by popularity */
    discoverMoviesByGenre: (genreId, page = 1) =>
      fetchFromTMDB("/discover/movie", {
        with_genres: genreId,
        page,
        sort_by: "popularity.desc",
      }),
  };
})();
