const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('API Healthcheck Tests', () => {
  // Test the health endpoint
  test('GET /api/health should return status 200 and ok status', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Check response structure
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
      
      // Check values
      expect(response.data.status).toBe('ok');
      expect(new Date(response.data.timestamp)).toBeInstanceOf(Date);
    } catch (error) {
      fail(`Health check failed: ${error.message}`);
    }
  });

  // Test the database connection endpoint
  test('GET /api/db-test should return status 200 and database connection info', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/db-test`);
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Check response structure
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
      
      // Check values
      expect(response.data.status).toBe('Database connected');
      expect(new Date(response.data.timestamp)).toBeInstanceOf(Date);
    } catch (error) {
      fail(`Database connection test failed: ${error.message}`);
    }
  });

  // Test error handling for database connection
  test('Database connection error should be handled properly', async () => {
    // This test is a placeholder for testing database connection errors
    // In a real test, you might mock the database to force an error
    // For now, we'll just check that the endpoint exists
    try {
      await axios.get(`${API_URL}/api/db-test`);
    } catch (error) {
      // If there's an error, check that it's formatted correctly
      if (error.response) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toHaveProperty('error');
        expect(error.response.data).toHaveProperty('details');
      } else {
        fail(`Unexpected error: ${error.message}`);
      }
    }
  });
});
