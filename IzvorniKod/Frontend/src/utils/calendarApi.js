import { api } from './api';

/**
 * Calendar API utilities for managing termini (availability slots) and rezervacije (bookings)
 */

// ==================== Google Calendar Connection ====================

/**
 * Get the URL to initiate Google Calendar OAuth flow
 */
export const getGoogleAuthUrl = async () => {
  const frontendOrigin = window.location.origin;
  return api.get('/calendar/google/auth-url', {
    params: { frontendOrigin }
  });
};

/**
 * Check if current walker has Google Calendar connected
 */
export const getGoogleConnectionStatus = async () => {
  return api.get('/calendar/google/status');
};

/**
 * Disconnect Google Calendar from walker's account
 */
export const disconnectGoogleCalendar = async () => {
  return api.post('/calendar/google/disconnect', {});
};

// ==================== Termini (Availability Slots) ====================

/**
 * Get all termini (available time slots) for a specific walker
 * @param {number} walkerId - ID of the walker
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 */
export const getWalkerTermini = async (walkerId, from, to) => {
  let url = `/calendar/walkers/${walkerId}/termini`;
  const params = [];
  if (from) params.push(`from=${from}`);
  if (to) params.push(`to=${to}`);
  if (params.length) url += `?${params.join('&')}`;
  return api.get(url);
};

/**
 * Get all termini for the currently logged-in walker
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 */
export const getMyTermini = async (from, to) => {
  let url = '/calendar/my-termini';
  const params = [];
  if (from) params.push(`from=${from}`);
  if (to) params.push(`to=${to}`);
  if (params.length) url += `?${params.join('&')}`;
  return api.get(url);
};

/**
 * Create a new termin (availability slot) for the current walker
 * @param {Object} termin - Termin details
 * @param {string} termin.startTime - ISO datetime string
 * @param {string} termin.endTime - ISO datetime string  
 * @param {number} termin.maxDogs - Max dogs for this slot (1 for solo, >1 for group)
 */
export const createTermin = async (termin) => {
  return api.post('/calendar/termini', termin);
};

/**
 * Update an existing termin
 * @param {number} terminId - ID of the termin to update
 * @param {Object} termin - Updated termin details
 */
export const updateTermin = async (terminId, termin) => {
  return api.put(`/calendar/termini/${terminId}`, termin);
};

/**
 * Delete a termin
 * @param {number} terminId - ID of the termin to delete
 */
export const deleteTermin = async (terminId) => {
  return api.delete(`/calendar/termini/${terminId}`);
};

// ==================== Rezervacije (Bookings) ====================

/**
 * Get all rezervacije for the currently logged-in user (walker or owner)
 * @param {string} status - Filter by status (optional)
 */
export const getMyRezervacije = async (status) => {
  let url = '/calendar/my-rezervacije';
  if (status) url += `?status=${status}`;
  return api.get(url);
};

/**
 * Create a new rezervacija (booking) for a termin
 * @param {Object} rezervacija - Booking details
 * @param {number} rezervacija.terminId - ID of the termin to book
 * @param {number[]} rezervacija.dogIds - Array of dog IDs to include in the walk
 */
export const createRezervacija = async (rezervacija) => {
  return api.post('/calendar/rezervacije', rezervacija);
};

/**
 * Update status of a rezervacija (confirm, cancel, etc.)
 * @param {number} rezervacijaId - ID of the rezervacija
 * @param {string} status - New status
 */
export const updateRezervacijaStatus = async (rezervacijaId, status) => {
  return api.put(`/calendar/rezervacije/${rezervacijaId}/status`, { status });
};

// ==================== Reviews ====================

/**
 * Create a review for a completed booking
 * @param {number} rezervacijaId - ID of the rezervacija
 * @param {number} ocjena - Rating (1-5)
 * @param {string} komentar - Optional comment
 */
export const createReview = async (rezervacijaId, ocjena, komentar = null) => {
  return api.post(`/calendar/rezervacije/${rezervacijaId}/recenzija`, { ocjena, komentar });
};

// ==================== Walker Discovery ====================

/**
 * Get list of walkers with calendar enabled
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of results per page
 */
export const getWalkersWithCalendar = async (page = 1, pageSize = 20) => {
  return api.get(`/calendar/walkers?page=${page}&pageSize=${pageSize}`);
};

/**
 * Get a specific walker's summary info
 * @param {number} walkerId - ID of the walker
 */
export const getWalkerSummary = async (walkerId) => {
  return api.get(`/calendar/walkers/${walkerId}`);
};
