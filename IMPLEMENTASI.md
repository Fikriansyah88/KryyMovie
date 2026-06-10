# Implementasi Firebase Authentication & Firestore Database untuk KryyMovie

## 📋 Ringkasan Perubahan

Upgrade ini mengintegrasikan Firebase untuk autentikasi pengguna dan penyimpanan data cloud, mengubah aplikasi dari standalone menjadi full-stack portfolio-ready.

---

## 📁 Struktur Folder (New)

```
KryyMovie/
├── config.js                    # Konfigurasi TMDB & Firebase
├── index.html                   # Landing & routing utama
├── style.css                    # Global stylesheet
│
├── js/
│   ├── api.js                   # TMDB API calls
│   ├── main.js                  # App orchestrator & routing
│   ├── storage.js               # LocalStorage helpers (deprecated untuk watchlist)
│   ├── ui.js                    # UI rendering engine
│   │
│   └── firebase/
│       ├── firebase-init.js     # ✨ Firebase initialization & config
│       ├── auth.js              # ✨ Authentication module (login, register, logout)
│       ├── firestore.js         # ✨ Firestore operations (watchlist, reviews)
│       └── user.js              # ✨ User state management
│
└── pages/
    ├── auth.html                # ✨ Auth container (login & register views)
    ├── profile.html             # ✨ Profile page
    └── styles/
        ├── auth.css             # ✨ Auth page styles
        └── profile.css          # ✨ Profile page styles
```

---

## 📝 File yang Harus Ditambahkan

### 1. **js/firebase/firebase-init.js** ✨ NEW

Initialization Firebase dan konfigurasi.

**Tujuan:**

- Import Firebase SDK
- Initialize Firebase dengan credentials
- Export Firebase instances (auth, db)

**Konten:**

```javascript
// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };
```

---

### 2. **js/firebase/auth.js** ✨ NEW

Module autentikasi (login, register, logout, session persistence).

**Tujuan:**

- Handle signup & signin
- Manage session persistence
- Password validation & error handling

**Fitur:**

- `registerUser(email, password, username)`
- `loginUser(email, password)`
- `logoutUser()`
- `getCurrentUser()`
- `onAuthStateChanged()` listener

---

### 3. **js/firebase/firestore.js** ✨ NEW

Operations untuk Firestore (watchlist & reviews).

**Tujuan:**

- CRUD operations untuk watchlist
- CRUD operations untuk reviews
- Real-time listeners

**Fitur:**

- `addToWatchlist(userId, movieData)`
- `removeFromWatchlist(userId, movieId)`
- `getWatchlist(userId)`
- `saveReview(userId, movieId, rating, comment)`
- `getReviews(movieId)` → ambil semua review film
- `getUserReviews(userId)` → ambil semua review user
- `deleteReview(userId, reviewId)`

**Firestore Collections Structure:**

```
users/
  {userId}/
    - username: string
    - email: string
    - createdAt: timestamp
    - avatar: string (optional)

watchlists/
  {userId}/movies/{movieId}
    - id: number
    - title: string
    - poster_path: string
    - release_date: string
    - vote_average: number
    - addedAt: timestamp

reviews/
  {reviewId}
    - userId: string
    - username: string
    - movieId: number
    - rating: number (1-5)
    - comment: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

---

### 4. **js/firebase/user.js** ✨ NEW

User state management global.

**Tujuan:**

- Manage current user state di memory
- Subscribe ke perubahan auth state
- Expose user info ke modules lain

**Fitur:**

- `user` object global dengan { uid, email, username, displayName }
- Observer pattern untuk UI updates
- Helper methods: `isUserLoggedIn()`, `getUserId()`, etc.

---

### 5. **pages/auth.html** ✨ NEW

Halaman login & register dengan toggle view.

**Struktur:**

- Header minimal (logo + back to home)
- Form login:
  - Email input
  - Password input
  - "Don't have account? Register" link
  - Login button
- Form register:
  - Username input
  - Email input
  - Password input (dengan strength indicator)
  - Confirm password input
  - "Already have account? Login" link
  - Register button
- Loading spinner overlay
- Error alert banner
- Footer

---

### 6. **pages/profile.html** ✨ NEW

Halaman profil user.

**Struktur:**

- Header dengan logout button
- User info card:
  - Username
  - Email
  - Join date
  - Avatar (placeholder)
- Stats:
  - Total watchlist movies
  - Total reviews written
- Quick links:
  - Go to my watchlist
  - View my reviews (atau di tab terpisah di home)
- Logout confirmation modal

---

### 7. **pages/styles/auth.css** ✨ NEW

Styling untuk halaman auth.

**Elemen:**

- Form containers
- Input fields dengan focus states
- Password strength meter
- Loading spinner
- Error & success banners
- Responsive untuk mobile

---

### 8. **pages/styles/profile.css** ✨ NEW

Styling untuk halaman profil.

**Elemen:**

- Profile card
- Stats sections
- Action buttons
- Responsive grid untuk desktop/mobile

---

## 📝 File yang Harus Dimodifikasi

### 1. **index.html** (Existing)

**Perubahan:**

- Tambahkan link ke `pages/auth.html` dan `pages/profile.html` di nav
- Sidebar/burger menu untuk mobile
- Logout button (hidden when not authenticated)
- Username display di navbar
- Script import untuk Firebase modules

**Delta:**

```html
<!-- Sebelum -->
<nav class="nav-links">
  <a href="#/" class="nav-link active" id="nav-home">Home</a>
  <a href="#/watchlist" class="nav-link" id="nav-watchlist">Watchlist</a>
</nav>

<!-- Sesudah -->
<nav class="nav-links">
  <a href="#/" class="nav-link active" id="nav-home">Home</a>
  <a href="#/watchlist" class="nav-link" id="nav-watchlist">Watchlist</a>
  <a
    href="pages/profile.html"
    class="nav-link"
    id="nav-profile"
    style="display:none;"
    >Profile</a
  >
  <button id="nav-logout" class="nav-link" style="display:none;">Logout</button>
  <a href="pages/auth.html" class="nav-link" id="nav-login">Login</a>
</nav>

<div id="user-info" class="user-info" style="display:none;">
  <span id="username-display"></span>
</div>

<!-- Script imports (di akhir body) -->
<script type="module" src="js/firebase/firebase-init.js"></script>
<script type="module" src="js/firebase/auth.js"></script>
<script type="module" src="js/firebase/firestore.js"></script>
<script type="module" src="js/firebase/user.js"></script>
```

---

### 2. **config.js** (Existing)

**Perubahan:**

- Tambahkan Firebase configuration
- Tambahkan API endpoints untuk error messages

**Delta:**

```javascript
const CONFIG = {
  // TMDB
  API_KEY: "662bb722d84aa081c497393d42407260",
  BASE_URL: "https://api.themoviedb.org/3",
  // ... existing TMDB config

  // Firebase
  FIREBASE_CONFIG: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
  },

  // Validation rules
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
};
```

---

### 3. **js/storage.js** (Existing)

**Perubahan:**

- Keep untuk localStorage emergency fallback
- Tambahkan flag untuk Firestore mode
- DEPRECATED untuk watchlist (gunakan Firestore)

**Delta:**

```javascript
const STORAGE = (() => {
  const WATCHLIST_KEY = "kryymovie_watchlist";
  const RATINGS_KEY = "kryymovie_ratings";
  const FIRESTORE_ENABLED = true; // Flag untuk toggle Firestore

  // ... existing functions

  // ── Firestore Migration ──
  const useFirestore = () => FIRESTORE_ENABLED;

  return {
    // ... existing exports
    useFirestore,
  };
})();
```

---

### 4. **js/main.js** (Existing)

**Perubahan:**

- Import Firebase modules
- Add routes untuk `/login` dan `/profile`
- Check auth state pada startup
- Update watchlist operations untuk Firestore
- Update review operations untuk Firestore

**Delta:**

```javascript
// Tambah di awal (setelah DOMContentLoaded)
import { auth } from "./firebase/firebase-init.js";
import { getCurrentUser, observeAuthState } from "./firebase/auth.js";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "./firebase/firestore.js";

// Observer untuk auth changes
observeAuthState((user) => {
  if (user) {
    updateUIForLoggedInUser(user);
  } else {
    updateUIForLoggedOutUser();
  }
});

// Router untuk /login dan /profile
const handleRouting = () => {
  const hash = window.location.hash || "#/";

  if (hash === "#/login") {
    routeToLogin();
  } else if (hash === "#/profile") {
    routeToProfile();
  }
  // ... existing routes
};

// Fungsi untuk update watchlist dari Firestore
const syncWatchlistFromFirestore = async () => {
  if (!getCurrentUser()) return;
  const watchlist = await getWatchlist(getCurrentUser().uid);
  // Update UI dengan watchlist dari Firestore
};
```

---

### 5. **js/ui.js** (Existing)

**Perubahan:**

- Modifikasi watchlist button behavior untuk Firestore
- Update review section untuk tampilkan reviews dari Firestore
- Add loading states untuk Firestore operations
- Tambahkan loading skeleton untuk auth

**Delta:**

```javascript
// Update watchlist toggle untuk call Firestore
const watchlistBtn = e.target.closest(".watchlist-toggle-btn");
if (watchlistBtn) {
  // Check if user is logged in
  if (!getCurrentUser()) {
    UI.showToast("Silakan login untuk menambah ke watchlist", "error");
    window.location.href = "pages/auth.html";
    return;
  }

  // Use Firestore instead of localStorage
  const movieData = JSON.parse(watchlistBtn.getAttribute("data-movie-data"));
  const userId = getCurrentUser().uid;

  if (isInWatchlistFirestore(userId, movieData.id)) {
    await removeFromWatchlist(userId, movieData.id);
  } else {
    await addToWatchlist(userId, movieData);
  }
}

// Update review section untuk load dari Firestore
const loadReviewsFromFirestore = async (movieId) => {
  const reviews = await getReviews(movieId);
  renderReviews(reviews);
};
```

---

### 6. **style.css** (Existing)

**Perubahan:**

- Tambahkan styles untuk user info di navbar
- Tambahkan spinner/loader styles untuk async operations
- Tambahkan styles untuk logout button
- Responsive navbar adjustments

**Delta:**

```css
/* User info di navbar */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

#username-display {
  color: var(--accent-gold);
  font-weight: 600;
}

/* Logout button styling */
#nav-logout {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

#nav-logout:hover {
  background: var(--accent-error);
  border-color: var(--accent-error);
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-muted);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading overlay */
.auth-loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.auth-loading-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}
```

---

## 🔄 Data Migration Strategy

### Phase 1: Keep existing LocalStorage data

- User yang sudah punya watchlist di localStorage tetap tersimpan
- Saat user login, tanyakan: "Migrate existing watchlist to cloud?" (optional)

### Phase 2: Firestore as primary

- Setelah login, watchlist disimpan di Firestore
- Tampilkan warning jika ada data di localStorage yang belum di-sync

---

## 🛡️ Error Handling Matrix

| Scenario              | Message                                      | Action                                |
| --------------------- | -------------------------------------------- | ------------------------------------- |
| Email sudah terdaftar | "Email sudah digunakan. Silakan login."      | Focus ke email input                  |
| Password < 6 char     | "Password minimal 6 karakter."               | Focus ke password input               |
| Password tidak match  | "Konfirmasi password tidak sesuai."          | Clear confirm field                   |
| Login gagal           | "Email atau password salah."                 | Clear password, focus email           |
| Network error         | "Gagal terhubung ke internet."               | Retry button                          |
| Firestore write error | "Gagal menyimpan data. Coba lagi."           | Auto-retry dengan exponential backoff |
| Auth session expired  | "Sesi Anda kadaluarsa. Silakan login ulang." | Redirect ke login                     |

---

## 🎯 Authentication Flow

```
User visits app
    ↓
Check auth state from Firebase
    ├─ Logged in → Load user data, show username, hide login button
    └─ Not logged in → Show login button, hide profile

User clicks "Login"
    ↓
Navigate to pages/auth.html
    ↓
Show login form
    ↓
User enters email & password
    ↓
Validate input locally
    ↓
Call Firebase auth.signInWithEmailAndPassword()
    ├─ Success → Auth state changes → redirected to home
    └─ Error → Show error message

User clicks "Register"
    ↓
Toggle to register form
    ↓
User enters username, email, password
    ↓
Validate input locally
    ↓
Call Firebase auth.createUserWithEmailAndPassword()
    ↓
Create user document in Firestore
    ├─ Success → Auto-login → redirected to home
    └─ Error → Show error message

User logs out
    ↓
Call Firebase auth.signOut()
    ↓
Auth state changes → UI updates, redirected to home
```

---

## 🎨 UI/UX Improvements

### Navbar (authenticated)

```
[Logo] [Home] [Watchlist] [Profile] [👤 Username] [Logout]
```

### Navbar (not authenticated)

```
[Logo] [Home] [Watchlist] [Login]
```

### Login/Register page

- Modern card layout
- Tab toggle (Login ↔ Register)
- Password strength indicator
- Social login placeholder (future)
- Remember me checkbox

### Profile page

- Card-based design
- Stats display (watchlist count, review count)
- Action buttons (Go to watchlist, Manage account)
- Settings link (future)

---

## 🔐 Security Best Practices

1. **Never store password in localStorage**
   - ✅ Firebase handles password hashing

2. **CORS & API Key Protection**
   - ✅ Configure Firebase security rules
   - ✅ Restrict TMDB API key usage

3. **Firestore Security Rules**

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /watchlists/{userId}/movies/{movieId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /reviews/{reviewId} {
         allow read: if true; // Public read
         allow write: if request.auth.uid == resource.data.userId;
         allow delete: if request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

4. **Session Management**
   - ✅ Firebase handles JWT refresh automatically
   - ✅ Session persists across page refresh

---

## 📦 Dependencies

### Firebase SDK (CDN via ES modules)

- `firebase/app`
- `firebase/auth`
- `firebase/firestore`

Version: 10.7.0 (latest stable as of 2024)

---

## ✅ Testing Checklist

- [ ] Register baru user dengan email/password
- [ ] Login dengan existing user
- [ ] Logout dan verify UI updates
- [ ] Refresh halaman → user tetap login
- [ ] Add movie ke watchlist (authenticated)
- [ ] Remove movie dari watchlist
- [ ] View watchlist hanya menampilkan user's own movies
- [ ] Submit review pada detail film
- [ ] View reviews dari other users
- [ ] Edit/delete own reviews
- [ ] Profile page menampilkan stats yang benar
- [ ] Error messages muncul dengan benar
- [ ] Loading states berfungsi
- [ ] Mobile responsive semua pages

---

## 📊 Before & After Comparison

| Fitur               | Before       | After                |
| ------------------- | ------------ | -------------------- |
| Authentication      | -            | ✅ Firebase Auth     |
| Watchlist Storage   | LocalStorage | Firestore (Cloud)    |
| Review Storage      | LocalStorage | Firestore (Cloud)    |
| User Profile        | -            | ✅ Profile Page      |
| Multi-user Support  | -            | ✅ Full support      |
| Session Persistence | LocalStorage | Firebase Session     |
| Error Handling      | Basic        | Comprehensive        |
| Security            | Browser only | Cloud + Server rules |

---

## 📋 Implementation Order

1. Create Firebase project & get config
2. Add `firebase-init.js`
3. Add `auth.js` with login/register logic
4. Add `firestore.js` with CRUD operations
5. Add `user.js` for state management
6. Modify `index.html` untuk navigation
7. Create `pages/auth.html`
8. Create `pages/profile.html`
9. Create CSS files untuk auth & profile
10. Update `main.js` untuk routing & Firebase integration
11. Update `ui.js` untuk Firestore operations
12. Update `style.css` untuk new components
13. Update `config.js` dengan Firebase config
14. Testing & debugging

---

## 🚀 Deployment Notes

- Set Firebase environment variables di `.env` atau config
- Update Firestore security rules sebelum production
- Enable email verification di Firebase Console
- Setup custom domain di Firebase Hosting (optional)
- Configure CORS untuk TMDB API requests

---

## 📝 Notes untuk Developer

- Gunakan async/await untuk Firestore operations
- Implement offline support dengan Firestore offline persistence
- Add error boundaries di kritical sections
- Monitor Firebase quota limits (free tier: 50k reads/day)
- Setup error logging (Sentry, Firebase Analytics, dll)

---

**Status:** Ready for implementation
**Last Updated:** 2026-06-06
**Version:** 1.0
