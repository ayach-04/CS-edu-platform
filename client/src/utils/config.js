/**
 * Configuration utility for the Edu CS Platform
 * Centralizes access to environment variables and configuration settings
 */

// API Base URL from environment variables with fallback
export const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL ?
  `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api` :
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Other configuration settings can be added here
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'video/webm',
  'image/jpeg',
  'image/png',
  'image/gif'
];

// Environment information
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Export configuration object
const config = {
  API_BASE_URL,
  MAX_FILE_SIZE,
  SUPPORTED_FILE_TYPES,
  IS_PRODUCTION,
  IS_DEVELOPMENT
};

export default config;
