# 🎬 KryyMovie

KryyMovie adalah aplikasi web pencarian film yang dibangun menggunakan JavaScript, HTML, dan CSS dengan integrasi Firebase Authentication. Pengguna dapat mencari film, melihat detail film, serta membuat akun untuk mengakses fitur personalisasi.

---

## 🚀 Features

### Movie Features

* Search Movies
* View Movie Details
* Responsive User Interface
* Real-Time Movie Data

### Authentication Features

* User Registration
* User Login
* User Logout
* Session Management
* User Profile Page

### Firebase Features

* Firebase Authentication
* Cloud Firestore Database
* User Data Storage

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend Services

* Firebase Authentication
* Cloud Firestore

### API

* Movie Database API (TMDB/OMDb sesuai yang digunakan)

---

## 📂 Project Structure

```text
KryyMovie/
│
├── index.html
├── style.css
├── config.js
│
├── js/
│   ├── main.js
│   ├── ui.js
│   │
│   └── firebase/
│       ├── firebase-init.js
│       ├── auth.js
│       ├── firestore.js
│       └── user.js
│
├── pages/
│   ├── auth.html
│   ├── profile.html
│   └── scripts/
│
├── IMPLEMENTASI.md
├── SETUP_GUIDE.md
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/USERNAME/KryyMovie.git
cd KryyMovie
```

### Configure Firebase

Edit:

```javascript
config.js
```

Masukkan konfigurasi Firebase Project Anda.

### Run Project

Buka menggunakan Live Server VS Code atau web server lokal.

```bash
http://localhost:5500
```

---

## 🔐 Authentication Flow

1. User membuka halaman Login/Register
2. User membuat akun baru
3. Data akun disimpan di Firebase Authentication
4. Informasi pengguna disimpan di Firestore
5. User login
6. Session otomatis dipertahankan oleh Firebase
7. User dapat logout melalui halaman Profile

---

## 📸 Screenshots

### Home Page

Tambahkan screenshot di sini.

### Login Page

Tambahkan screenshot di sini.

### Profile Page

Tambahkan screenshot di sini.

---

## 🗺️ Roadmap

### v1.1

* Firebase Authentication
* User Registration
* User Login
* User Logout
* User Profile
* Firestore Integration

### v1.2 (Planned)

* Favorite Movies
* Watchlist
* Movie Rating
* Dark Mode

### v1.3 (Planned)

* Personalized Recommendations
* User Avatar
* Social Features

---

## 👨‍💻 Author

Fikri

Portfolio Project - KryyMovie

```
```
