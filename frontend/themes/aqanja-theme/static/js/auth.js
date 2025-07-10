// API base URL
const API_URL = 'http://localhost:3000/api';
console.log('Auth.js loaded');
document.addEventListener('DOMContentLoaded', function() {
  //DEBUG
  console.log('DOM loaded in auth.js');
  // Check if auth-container exists
  const authContainer = document.getElementById('auth-container');
  console.log('Auth container:', authContainer);
  // Debug page content
  console.log('Current page path:', window.location.pathname);
  console.log('Page title:', document.title);
  console.log('Main content:', document.querySelector('main')?.innerHTML || 'No main element found');
  console.log('All forms on page:', document.querySelectorAll('form'));
  console.log('Login form:', document.getElementById('login-form'));
  //DEBUG

  // Check if user is logged in
  checkAuthStatus();
  
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Handle register form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

// Check if user is logged in
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const authContainer = document.getElementById('auth-container');
  
  if (!token) {
    // User is not logged in
    if (authContainer) {
      authContainer.innerHTML = `
        <a href="/login" class="btn">Login</a>
        <a href="/register" class="btn">Register</a>
      `;
    }
    return;
  }
  
  // User has a token, verify it
  fetch(`${API_URL}/auth/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    return response.json();
  })
  .then(user => {
    // User is logged in
    if (authContainer) {
      authContainer.innerHTML = `
        <span>Welcome, ${user.username}</span>
        <button id="logout-btn" class="btn">Logout</button>
      `;
      
      // Add event listener to the newly created logout button
      document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
    
    // If we're on an admin page and user is not admin, redirect
    if (window.location.pathname.includes('/admin') && !user.is_admin) {
      window.location.href = '/';
    }
  })
  .catch(error => {
    console.error('Auth error:', error);
    // Token is invalid, clear it
    localStorage.removeItem('token');
    if (authContainer) {
      authContainer.innerHTML = `
        <a href="/login" class="btn">Login</a>
        <a href="/register" class="btn">Register</a>
      `;
    }
  });
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageElement = document.getElementById('login-message');
  
  // Clear previous messages
  if (messageElement) {
    messageElement.textContent = '';
    messageElement.className = 'form-message';
  }
  
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Login successful
      localStorage.setItem('token', data.token);
      
      if (messageElement) {
        messageElement.textContent = 'Login successful! Redirecting...';
        messageElement.className = 'form-message success';
      }
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      // Login failed
      if (messageElement) {
        messageElement.textContent = data.message || 'Login failed. Please check your credentials.';
        messageElement.className = 'form-message error';
      }
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    if (messageElement) {
      messageElement.textContent = 'An error occurred. Please try again.';
      messageElement.className = 'form-message error';
    }
  });
}

// Handle register form submission
function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageElement = document.getElementById('register-message');
  
  // Clear previous messages
  if (messageElement) {
    messageElement.textContent = '';
    messageElement.className = 'form-message';
  }
  
  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Registration successful
      localStorage.setItem('token', data.token);
      
      if (messageElement) {
        messageElement.textContent = 'Registration successful! Redirecting...';
        messageElement.className = 'form-message success';
      }
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      // Registration failed
      if (messageElement) {
        messageElement.textContent = data.message || 'Registration failed. Please try again.';
        messageElement.className = 'form-message error';
      }
    }
  })
  .catch(error => {
    console.error('Registration error:', error);
    if (messageElement) {
      messageElement.textContent = 'An error occurred. Please try again.';
      messageElement.className = 'form-message error';
    }
  });
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('token');
  
  // Update UI
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.innerHTML = `
      <a href="/login" class="btn">Login</a>
      <a href="/register" class="btn">Register</a>
    `;
  }
  
  // Redirect to home page if on a protected page
  const currentPath = window.location.pathname;
  if (currentPath.includes('/admin') || currentPath === '/profile') {
    window.location.href = '/';
  } else {
    // Just refresh the current page
    window.location.reload();
  }
}