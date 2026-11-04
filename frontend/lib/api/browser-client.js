"use client";

import axios from "axios";
import { toApiError } from "./errors";

/**
 * Axios instance for Client Components (Step 6 §4.1).
 * Sends the Laravel session cookie and the XSRF token on every request.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

let csrfRequest = null;

/** Fetch the Sanctum CSRF cookie once (needed before login/register and after a 419). */
export function ensureCsrfCookie(force = false) {
  if (!csrfRequest || force) {
    csrfRequest = axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true }).catch((error) => {
      csrfRequest = null;
      throw error;
    });
  }
  return csrfRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // CSRF token expired: refresh it and retry the request once.
    if (response?.status === 419 && config && !config._retriedCsrf) {
      config._retriedCsrf = true;
      await ensureCsrfCookie(true);
      return api.request(config);
    }

    return Promise.reject(toApiError(response?.status ?? 0, response?.data));
  },
);
