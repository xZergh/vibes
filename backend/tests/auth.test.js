const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test user data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123!'
};

let authToken;

describe('Authentication API Tests', () => {
  // Test user registration
  test('POST /api/auth/register should create a new user and return a token', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
      
      // Check status code
      expect(response.status).toBe(201);
      
      // Check response structure
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('token');
      
      // Save token for later tests
      authToken = response.data.token;
      
      // Check values
      expect(response.data.message).toBe('User registered successfully');
      expect(authToken).toBeTruthy();
    } catch (error) {
      fail(`Registration failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // Test user login
  test('POST /api/auth/login should authenticate user and return a token', async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Check response structure
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('token');
      
      // Check values
      expect(response.data.message).toBe('Login successful');
      expect(response.data.token).toBeTruthy();
      
      // Update token
      authToken = response.data.token;
    } catch (error) {
      fail(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // Test getting user data
  test('GET /api/auth/user should return authenticated user data', async () => {
    // Skip if no auth token
    if (!authToken) {
      console.warn('Skipping user data test - no auth token available');
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Check response structure
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('username');
      expect(response.data).toHaveProperty('email');
      expect(response.data).toHaveProperty('is_admin');
      
      // Check values
      expect(response.data.username).toBe(testUser.username);
      expect(response.data.email).toBe(testUser.email);
    } catch (error) {
      fail(`Getting user data failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // Test invalid login
  test('POST /api/auth/login with invalid credentials should return 401', async () => {
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
      
      // Should not reach here
      fail('Login with invalid credentials should have failed');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toBe('Invalid credentials');
    }
  });
});
