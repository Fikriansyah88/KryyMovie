const UI = (() => {
  const container = document.getElementById("app-content");

  // ── Helper Sub-renders ───────────────────────────────────────────────────

  const FALLBACK_POSTER =
    "https://placehold.co/500x750/1a1a1a/f5c518?text=No+Poster";
  const FALLBACK_AVATAR = "https://placehold.co/185x278/1a1a1a/666666?text=?";

  const renderMovieCard = (movie) => {
    const poster = movie.poster_path
      ? `${CONFIG.IMAGE_BASE_URL}${CONFIG.POSTER_SIZE}${movie.poster_path}`
      : FALLBACK_POSTER;

    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    // Note: watchlist status will be checked asynchronously on page load
    // Default to not in watchlist (can be updated via event handler)
    const inWatchlist = false;

    return `
      <article class="movie-card" data-movie-id="${movie.id}">
        <div class="card-poster-wrapper">
          <img class="card-poster" src="${poster}" alt="${movie.title}" loading="lazy"
               onerror="this.src='${FALLBACK_POSTER}'">
          
          <button class="watchlist-toggle-btn ${inWatchlist ? "in-watchlist" : ""}" 
                  data-movie-data='${JSON.stringify({
                    id: movie.id,
                    title: movie.title.replace(/'/g, "&#39;"),
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                  })}'
                  aria-label="${inWatchlist ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}">
            <svg viewBox="0 0 24 24" fill="${inWatchlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          
          <div class="rating-badge">
            <svg viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>${rating}</span>
          </div>
        </div>

        <div class="card-details">
          <h3 class="card-title">${movie.title}</h3>
          <div class="card-info">
            <span class="card-year">${year}</span>
            <a href="#/detail/${movie.id}" class="card-more-link">
              Details &rarr;
            </a>
          </div>
        </div>
      </article>
    `;
  };

  const renderEmptyMoviesState = () => `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; color: var(--text-secondary);">
      <svg style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p style="font-size: 1.1rem; font-weight: 500;">Film tidak ditemukan. Silakan cari dengan kata kunci lain.</p>
    </div>
  `;

  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatReviewDate = (value) => {
    if (!value) return "-";

    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Public Layout Renders ────────────────────────────────────────────────

  const showLoader = () => {
    container.innerHTML = `
      <div class="movie-grid">
        ${Array.from({ length: 8 })
          .map(
            () => `
            <div class="skeleton-card skeleton">
              <div class="skeleton-poster"></div>
              <div class="skeleton-text-container">
                <div class="skeleton-line title skeleton"></div>
                <div class="skeleton-line meta skeleton"></div>
              </div>
            </div>
          `,
          )
          .join("")}
      </div>
    `;
  };

  const showError = (message, onRetry) => {
    container.innerHTML = `
      <div class="error-state">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h3>Oops, terjadi kesalahan</h3>
        <p>${message}</p>
        <button class="btn-retry" id="error-retry-btn">Coba Lagi</button>
      </div>
    `;

    const retryBtn = document.getElementById("error-retry-btn");
    if (retryBtn && onRetry) {
      retryBtn.addEventListener("click", onRetry, { once: true });
    }
  };

  const showToast = (message, type = "success") => {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icon =
      type === "success"
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, 3000);
  };

  const renderHomeView = (
    movies,
    page,
    totalPages,
    genres,
    activeGenreId,
    searchQuery,
  ) => {
    container.innerHTML = `
      <div class="home-view">
        <!-- Hero Banner (Only on page 1 without search queries) -->
        ${
          !searchQuery && page === 1
            ? `
          <div class="hero-banner">
            <div class="hero-content">
              <h1 class="hero-title">Your Ultimate Movie <span>Companion</span></h1>
              <p class="hero-subtitle">Discover popular blockbusters, filter categories, rate titles, and manage your watchlist.</p>
            </div>
          </div>
        `
            : ""
        }

        <!-- Controls Container -->
        <div class="controls-container">
          <!-- Search input wrapper -->
          <div class="search-wrapper">
            <input type="text" class="search-input" id="search-input" placeholder="Search movies by title (min. 2 characters)..." value="${searchQuery}">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <!-- Genre Filter Horizontal Scroll -->
          <div class="genre-container" id="genre-container">
            <button class="genre-chip ${!activeGenreId ? "active" : ""}" data-genre-id="">Semua Genre</button>
            ${genres
              .map(
                (genre) => `
              <button class="genre-chip ${activeGenreId == genre.id ? "active" : ""}" data-genre-id="${genre.id}">
                ${genre.name}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- Section Title Header -->
        <div class="section-header">
          <h2 class="section-title">
            ${
              searchQuery
                ? `Results for "${searchQuery}"`
                : activeGenreId
                  ? `${genres.find((g) => String(g.id) === String(activeGenreId))?.name || "Category"} Movies`
                  : "Popular Movies"
            }
          </h2>
        </div>

        <!-- Cards Grid -->
        <div class="movie-grid">
          ${movies.length ? movies.map((m) => renderMovieCard(m)).join("") : renderEmptyMoviesState()}
        </div>

        <!-- Pagination Controls -->
        ${
          movies.length && totalPages > 1
            ? `
          <div class="pagination-container">
            <button class="pagination-btn" id="prev-page-btn" ${page <= 1 ? "disabled" : ""}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Sebelumnya
            </button>
            <span class="page-indicator">Halaman ${page} dari ${totalPages}</span>
            <button class="pagination-btn" id="next-page-btn" ${page >= totalPages ? "disabled" : ""}>
              Berikutnya
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;
  };

  const renderWatchlistView = (movies) => {
    container.innerHTML = `
      <div class="watchlist-view">
        <div class="section-header">
          <h2 class="section-title">My Watchlist</h2>
        </div>

        <div class="movie-grid">
          ${
            movies.length
              ? movies.map((m) => renderMovieCard(m)).join("")
              : `
              <div class="watchlist-empty-state" style="grid-column: 1 / -1;">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3>Watchlist Anda Kosong</h3>
                <p>Jelajahi berbagai film menarik dan simpan film pilihan Anda di sini.</p>
                <a href="#/" class="btn-browse">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Cari Film
                </a>
              </div>
            `
          }
        </div>
      </div>
    `;
  };

  const renderDetailView = (movie, credits, userReview = null) => {
    const backdrop = movie.backdrop_path
      ? `${CONFIG.IMAGE_BASE_URL}${CONFIG.BACKDROP_SIZE}${movie.backdrop_path}`
      : "";
    const poster = movie.poster_path
      ? `${CONFIG.IMAGE_BASE_URL}${CONFIG.POSTER_SIZE}${movie.poster_path}`
      : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=350&auto=format&fit=crop";

    const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
    const releaseDateStr = formatReleaseDate(movie.release_date);
    const ratingTMDB = movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "N/A";
    const genresList = (movie.genres || [])
      .map((g) => `<span class="genre-tag">${g.name}</span>`)
      .join("");

    const inWatchlist = false; // Will be updated asynchronously

    // Limit cast to 8 members
    const topCast = (credits?.cast || []).slice(0, 8);
    const castListHTML = topCast.length
      ? topCast
          .map((c) => {
            const avatar = c.profile_path
              ? `${CONFIG.IMAGE_BASE_URL}${CONFIG.PROFILE_SIZE}${c.profile_path}`
              : FALLBACK_AVATAR;
            return `
            <div class="cast-card">
              <div class="cast-avatar-wrapper">
                <img class="cast-avatar" src="${avatar}" alt="${c.name}" loading="lazy"
                   onerror="this.src='${FALLBACK_AVATAR}'">
              </div>
              <p class="cast-name">${c.name}</p>
              <p class="cast-character">${c.character}</p>
            </div>
          `;
          })
          .join("")
      : `<p style="color: var(--text-muted); font-style: italic;">Informasi pemeran tidak tersedia.</p>`;

    const hasExistingReview = !!userReview;
    const ratingValue = userReview?.rating || 0;
    const reviewText = userReview?.comment || "";

    container.innerHTML = `
      <div class="detail-view">
        <!-- Backdrop Banner with navigation back -->
        <div class="detail-backdrop">
          ${backdrop ? `<img class="backdrop-img" src="${backdrop}" alt="${movie.title}">` : ""}
          <div class="backdrop-overlay"></div>
          <div class="back-navigation">
            <button class="back-btn" onclick="history.back()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Kembali
            </button>
          </div>
        </div>

        <!-- Main details layout -->
        <div class="detail-main-layout">
          <!-- Poster / Action column -->
          <div class="detail-poster-col">
            <img class="detail-poster" src="${poster}" alt="${movie.title}">
            <div class="detail-actions">
              <button class="btn-watchlist-detail ${inWatchlist ? "added" : "not-added"}"
                      id="detail-watchlist-btn"
                      data-movie-data='${JSON.stringify({
                        id: movie.id,
                        title: movie.title.replace(/'/g, "&#39;"),
                        poster_path: movie.poster_path,
                        release_date: movie.release_date,
                        vote_average: movie.vote_average,
                      })}'>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${inWatchlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>${inWatchlist ? "Di Watchlist" : "Tambah ke Watchlist"}</span>
              </button>
            </div>
          </div>

          <!-- Metadata column -->
          <div class="detail-info-col">
            <div class="movie-header-info">
              <h1 class="detail-title">${movie.title}</h1>
              <div class="detail-meta">
                <span class="badge-rating">${ratingTMDB} TMDB</span>
                <span class="meta-divider"></span>
                <span class="meta-item">Rilis: ${releaseDateStr}</span>
                <span class="meta-divider"></span>
                <span class="meta-item">${runtime}</span>
              </div>
              <div class="genre-tags">
                ${genresList}
              </div>
            </div>

            <!-- Synopsis Section -->
            <div class="detail-section">
              <h3 class="detail-section-title">Sinopsis</h3>
              <p class="synopsis-text">${movie.overview || "Sinopsis tidak tersedia untuk film ini."}</p>
            </div>

            <!-- Cast Section -->
            <div class="detail-section">
              <h3 class="detail-section-title">Pemeran Utama</h3>
              <div class="cast-scroller">
                ${castListHTML}
              </div>
            </div>

            <!-- Ratings & Reviews Container -->
            <div class="detail-section">
              <h3 class="detail-section-title">Rating & Ulasan Anda</h3>
              <div class="rating-section">
                <!-- Form Submission Card -->
                <div class="rating-form-card">
                  <h4 style="margin-bottom: 0.75rem; font-weight: 600;">Tulis Ulasan Anda</h4>
                  
                  <div class="rating-stars-container" id="stars-selector" data-rating="${ratingValue}">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (v) => `
                      <span class="star-input ${v <= ratingValue ? "active" : ""}" data-value="${v}">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      </span>
                    `,
                      )
                      .join("")}
                  </div>

                  <div class="review-textarea-wrapper">
                    <textarea class="review-textarea" 
                              id="review-textarea" 
                              placeholder="Bagikan pendapat Anda tentang film ini (maks. 500 karakter)..." 
                              maxlength="500">${reviewText}</textarea>
                    <span class="review-char-count" id="char-counter">${reviewText.length}/500</span>
                  </div>

                  <div class="form-actions">
                    <button class="btn-submit-review" id="btn-submit-review" ${ratingValue === 0 ? "disabled" : ""}>
                      Simpan Ulasan
                    </button>
                    ${
                      hasExistingReview
                        ? `
                      <button class="btn-delete-review" id="btn-delete-review">
                        Hapus
                      </button>
                    `
                        : ""
                    }
                  </div>
                </div>

                <!-- Display Saved Review -->
                <div class="user-reviews-list">
                  <h4 style="margin-bottom: 0.75rem; font-weight: 600;">Ulasan Tersimpan</h4>
                  <div id="saved-review-display">
                    ${
                      hasExistingReview
                        ? `
                      <div class="user-review-item">
                        <div class="review-header">
                          <span class="review-user">Ulasan Anda</span>
                          <div class="review-stars">
                            ${Array.from({ length: 5 })
                              .map(
                                (_, i) => `
                              <svg viewBox="0 0 24 24" style="fill: ${i < ratingValue ? "var(--accent-gold)" : "var(--text-muted)"}; width: 16px; height: 16px;">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            `,
                              )
                              .join("")}
                          </div>
                        </div>
                        <p class="review-body">${reviewText || "Hanya memberikan rating bintang."}</p>
                        <span class="review-date">Terakhir diperbarui: ${formatReviewDate(userReview.updatedAt)}</span>
                      </div>
                    `
                        : `
                      <div class="no-reviews-placeholder">
                        Belum ada ulasan. Berikan rating bintang di samping untuk menambahkan ulasan.
                      </div>
                    `
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  };

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    showLoader,
    showError,
    showToast,
    renderHomeView,
    renderWatchlistView,
    renderDetailView,
  };
})();
