// User Registration Handler

const API_BASE_URL = 'https://dabbewale.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
  // Registration
  const registerForm = document.querySelector('form[action="register"]') || (window.location.pathname.includes('register') && document.querySelector('form'));
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role = 'consumer';
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (res.ok) {
          showNotification('Registration successful! You can now log in.');
          setTimeout(() => { window.location.href = 'login.html'; }, 1800);
        } else {
          showNotification(data.msg || 'Registration failed.');
        }
      } catch (err) {
        showNotification('An error occurred. Please try again.');
      }
    });
  }

  // Login
  const loginForm = document.querySelector('form[action="login"]') || (window.location.pathname.includes('login') && document.querySelector('form'));
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          if (data.user && data.user.name) {
            localStorage.setItem('userName', data.user.name);
          }
          showNotification('Login successful!');
          setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } else {
          showNotification(data.msg || 'Login failed.');
        }
      } catch (err) {
        showNotification('An error occurred. Please try again.');
      }
    });
  }

  // Signout
  const signoutBtn = document.getElementById('signoutBtn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      showNotification('You have been signed out.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    });
  }

  // Profile dropdown user info
  // (Removed old userInfo/loginBtn/profileIcon logic to avoid redeclaration)

  // Profile Icon and Dropdown
  const nav = document.querySelector('.main-navbar.improved-navbar');
  if (nav && !document.getElementById('profileIcon')) {
    const container = document.createElement('div');
    container.className = 'profile-icon-container';
    container.innerHTML = `
      <span id="profileIcon" tabindex="0" aria-haspopup="true" aria-expanded="false">👤</span>
      <div id="profileDropdown" class="profile-dropdown" tabindex="-1"></div>
    `;
    nav.appendChild(container);
  }

  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');

  function renderProfileDropdown() {
    const token = localStorage.getItem('token');
    let html = '';
    if (token) {
      let name = localStorage.getItem('userName');
      if (!name) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          name = payload.name || payload.email || 'User';
        } catch (e) {
          name = 'User';
        }
      }
      html = `
        <div class="dropdown-item" tabindex="-1" style="font-weight:700; cursor:default;">👋 ${name}</div>
        <hr class="dropdown-divider" />
        <button class="dropdown-item" id="signoutBtn" tabindex="0">Sign Out</button>
      `;
    } else {
      html = `
        <button class="dropdown-item" onclick="window.location.href='login.html'" tabindex="0">Log in as User</button>
        <button class="dropdown-item" onclick="window.location.href='provider-login.html'" tabindex="0">Provider Login</button>
        <button class="dropdown-item" onclick="window.location.href='provider-register.html'" tabindex="0">Provider Register</button>
        <button class="dropdown-item" onclick="window.location.href='register.html'" tabindex="0">User Sign Up</button>
      `;
    }
    profileDropdown.innerHTML = html;
  }

  if (profileIcon && profileDropdown) {
    renderProfileDropdown();
    profileIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = profileDropdown.classList.toggle('show');
      profileIcon.setAttribute('aria-expanded', expanded);
      if (expanded) renderProfileDropdown();
    });
    profileIcon.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        profileDropdown.classList.toggle('show');
        renderProfileDropdown();
      }
    });
    document.addEventListener('click', function(e) {
      if (!profileDropdown.contains(e.target) && e.target !== profileIcon) {
        profileDropdown.classList.remove('show');
        profileIcon.setAttribute('aria-expanded', 'false');
      }
    });
    profileDropdown.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'signoutBtn') {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        showNotification('You have been signed out.');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      }
    });
  }
});

// Notification utility
function showNotification(message, duration = 2500) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.style.display = 'block';
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 400);
  }, duration);
}
