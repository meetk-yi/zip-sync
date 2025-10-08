/**
 * Centralized Server Configuration
 * 
 * This file contains all server-related configuration constants.
 * Update the SERVER_IP here to change the IP address across the entire application.
 */

// Server IP Configuration
const SERVER_IP = '43.205.121.85';

// Server Ports
const FRONTEND_PORT = 5173;
const BACKEND_PORT = 5000;

// Server URLs
const FRONTEND_URL = `http://${SERVER_IP}:${FRONTEND_PORT}`;
const BACKEND_URL = `http://${SERVER_IP}:${BACKEND_PORT}`;

// API Base URL
const API_BASE_URL = BACKEND_URL;

// Export configuration
export {
    SERVER_IP,
    FRONTEND_PORT,
    BACKEND_PORT,
    FRONTEND_URL,
    BACKEND_URL,
    API_BASE_URL
};
