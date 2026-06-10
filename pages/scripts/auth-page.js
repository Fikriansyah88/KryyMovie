/**
 * KryyMovie — Auth Page Script
 * Handles login, register, form validation, and UI interactions
 */

import { registerUser, loginUser } from "../../js/firebase/auth.js";

// ── DOM Elements ─────────────────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authTabs = document.querySelectorAll(".auth-tab");
const authToggleBtns = document.querySelectorAll(".auth-toggle-btn");
const togglePasswordBtns = document.querySelectorAll(".toggle-password-btn");
const authLoadingOverlay = document.getElementById("auth-loading");
const loadingText = document.getElementById("loading-text");

// ── Form Elements ────────────────────────────────────────────────────────
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerConfirm = document.getElementById("register-confirm");
const registerBtn = document.getElementById("register-btn");
const registerError = document.getElementById("register-error");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");

// ── Utility Functions ────────────────────────────────────────────────────

/**
 * Show loading overlay
 */
const showLoading = (text = "Memproses...") => {
  loadingText.textContent = text;
  authLoadingOverlay.classList.add("active");
};

/**
 * Hide loading overlay
 */
const hideLoading = () => {
  authLoadingOverlay.classList.remove("active");
};

/**
 * Show error message
 */
const showError = (formType, message) => {
  const errorEl = formType === "login" ? loginError : registerError;
  errorEl.textContent = message;
  errorEl.style.display = "block";
};

/**
 * Clear error message
 */
const clearError = (formType) => {
  const errorEl = formType === "login" ? loginError : registerError;
  errorEl.style.display = "none";
  errorEl.textContent = "";
};

/**
 * Switch between login and register tabs
 */
const switchTab = (tabName) => {
  // Update tabs
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  // Update forms
  const forms = document.querySelectorAll(".auth-form");
  forms.forEach((form) => {
    form.classList.toggle("active", form.dataset.form === tabName);
  });

  // Clear errors
  clearError("login");
  clearError("register");
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username
 */
const isValidUsername = (username) => {
  return (
    username.length >= 3 &&
    username.length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
};

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength; // 0-5
};

/**
 * Update password strength display
 */
const updatePasswordStrength = () => {
  const password = registerPassword.value;
  const strength = calculatePasswordStrength(password);

  // Clear existing bars
  document.querySelectorAll(".strength-bar").forEach((bar) => {
    bar.className = "strength-bar";
  });

  // Add bars based on strength
  const container = document.querySelector(".password-strength-meter");
  container.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const bar = document.createElement("div");
    bar.className = "strength-bar";

    if (i < strength) {
      if (strength <= 2) {
        bar.classList.add("weak");
      } else if (strength <= 3) {
        bar.classList.add("medium");
      } else {
        bar.classList.add("strong");
      }
    }

    container.appendChild(bar);
  }

  // Update text
  let text = "";
  if (password.length === 0) {
    text = "";
  } else if (strength <= 2) {
    text = "Lemah - Gunakan kombinasi huruf, angka, dan simbol";
    strengthText.style.color = "var(--accent-error)";
  } else if (strength <= 3) {
    text = "Sedang - Password cukup kuat";
    strengthText.style.color = "#ff9800";
  } else {
    text = "Kuat - Password sangat aman";
    strengthText.style.color = "var(--accent-success)";
  }

  strengthText.textContent = text;
};

/**
 * Toggle password visibility
 */
const togglePasswordVisibility = (targetId) => {
  const input = document.getElementById(targetId);
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
};

// ── Event Listeners ─────────────────────────────────────────────────────

/**
 * Tab switching
 */
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchTab(tab.dataset.tab);
  });
});

/**
 * Toggle between login and register
 */
authToggleBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(btn.dataset.switchTo);
  });
});

/**
 * Toggle password visibility
 */
togglePasswordBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    togglePasswordVisibility(btn.dataset.target);
  });
});

/**
 * Password strength meter (register form)
 */
registerPassword.addEventListener("input", updatePasswordStrength);

/**
 * Login form submission
 */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError("login");

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  // Validation
  if (!email || !password) {
    showError("login", "Email dan password harus diisi");
    return;
  }

  if (!isValidEmail(email)) {
    showError("login", "Format email tidak valid");
    return;
  }

  // Show loading
  showLoading("Sedang login...");
  loginBtn.disabled = true;

  try {
    const result = await loginUser(email, password);

    // Success
    console.log("[AUTH PAGE] Login successful:", result.user.uid);

    // Redirect ke home
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (err) {
    console.error("[AUTH PAGE] Login error:", err.message);
    showError("login", err.message);
    hideLoading();
    loginBtn.disabled = false;
  }
});

/**
 * Register form submission
 */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError("register");

  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirm = registerConfirm.value;

  // Validation
  if (!username || !email || !password || !confirm) {
    showError("register", "Semua field harus diisi");
    return;
  }

  if (!isValidUsername(username)) {
    showError(
      "register",
      "Username harus 3-20 karakter (hanya huruf, angka, underscore)",
    );
    return;
  }

  if (!isValidEmail(email)) {
    showError("register", "Format email tidak valid");
    return;
  }

  if (password.length < 6) {
    showError("register", "Password minimal 6 karakter");
    return;
  }

  if (password !== confirm) {
    showError("register", "Konfirmasi password tidak sesuai");
    return;
  }

  if (!document.getElementById("terms-agree").checked) {
    showError("register", "Anda harus setuju dengan Syarat & Ketentuan");
    return;
  }

  // Show loading
  showLoading("Sedang membuat akun...");
  registerBtn.disabled = true;

  try {
    const result = await registerUser(email, password, username);

    // Success
    console.log("[AUTH PAGE] Register successful:", result.user.uid);

    // Redirect ke home
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (err) {
    console.error("[AUTH PAGE] Register error:", err.message);
    showError("register", err.message);
    hideLoading();
    registerBtn.disabled = false;
  }
});

// ── Input event listeners untuk clear error on input
loginEmail.addEventListener("input", () => clearError("login"));
loginPassword.addEventListener("input", () => clearError("login"));
registerEmail.addEventListener("input", () => clearError("register"));
registerPassword.addEventListener("input", () => clearError("register"));
registerConfirm.addEventListener("input", () => clearError("register"));

console.log("[AUTH PAGE] Script loaded");
