/**
 * Financial Concierge – API Helper
 *
 * Zentraler Fetch-Wrapper, der automatisch den JWT-Token
 * aus dem Cognito Auth Service anhängt.
 */
import { getIdToken } from './auth';

/**
 * Führt einen authentifizierten API-Call aus.
 * @param {string} url - Vollständige URL
 * @param {RequestInit} [options={}] - fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  const token = await getIdToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: token } : {}),
  };

  return fetch(url, { ...options, headers });
}

/**
 * Gibt die Basis-URL der API zurück.
 * @returns {string}
 */
export function getApiBaseUrl() {
  return window.APP_CONFIG?.API_BASE_URL || '';
}

/**
 * Prüft ob die API konfiguriert ist.
 * @returns {boolean}
 */
export function isApiConfigured() {
  const url = getApiBaseUrl();
  return !!url && !url.includes('REPLACE_WITH_API_ID');
}
