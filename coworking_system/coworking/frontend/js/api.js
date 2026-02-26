/**
 * API Utility
 * Centralized fetch wrapper for all backend calls
 */

const API_BASE = '/api';

// ---- Token management ----
const Auth = {
  getToken:  ()        => localStorage.getItem('cw_token'),
  setToken:  (t)       => localStorage.setItem('cw_token', t),
  removeToken: ()      => localStorage.removeItem('cw_token'),
  getUser:   ()        => { try { return JSON.parse(localStorage.getItem('cw_user')); } catch { return null; } },
  setUser:   (u)       => localStorage.setItem('cw_user', JSON.stringify(u)),
  removeUser: ()       => localStorage.removeItem('cw_user'),
  isLoggedIn: ()       => !!localStorage.getItem('cw_token'),
  logout: () => {
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_user');
    window.location.href = '/';
  }
};

// ---- Core fetch wrapper ----
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    Auth.logout();
    return data;
  }

  return data;
}

// ---- API methods ----
const API = {
  // Auth
  register: (body)            => apiFetch('/auth/register', { method: 'POST', body }),
  login:    (body)            => apiFetch('/auth/login',    { method: 'POST', body }),
  profile:  ()                => apiFetch('/auth/profile'),

  // Membership
  createMembership: (body)    => apiFetch('/memberships',         { method: 'POST', body }),
  getActiveMembership: ()     => apiFetch('/memberships/active'),
  getMembershipHistory: ()    => apiFetch('/memberships/history'),

  // Bookings
  createBooking: (body)       => apiFetch('/bookings',            { method: 'POST', body }),
  getMyBookings: (page = 1)   => apiFetch(`/bookings/my?page=${page}`),
  getBookingById: (id)        => apiFetch(`/bookings/${id}`),
  cancelBooking: (id)         => apiFetch(`/bookings/${id}/cancel`, { method: 'DELETE' }),
  checkAvailability: (params) => apiFetch('/bookings/availability?' + new URLSearchParams(params)),
  getDailyBookings: (date)    => apiFetch(`/bookings/daily?date=${date}`),
  getAllBookings: (params)     => apiFetch('/bookings/all?' + new URLSearchParams(params)),

  // Payments
  pay: (body)                 => apiFetch('/payments',            { method: 'POST', body }),
  getPaymentHistory: (page=1) => apiFetch(`/payments/history?page=${page}`),

  // Employee
  getInventory: ()            => apiFetch('/employee/inventory'),
  updateInventory: (id, qty)  => apiFetch(`/employee/inventory/${id}`, { method: 'PUT', body: { quantity: qty } }),
  addInventory: (body)        => apiFetch('/employee/inventory',  { method: 'POST', body }),
  getCCTV: ()                 => apiFetch('/employee/cctv'),

  // Manager
  getRevenue: (params)        => apiFetch('/manager/revenue?' + new URLSearchParams(params)),
  getCosts: (params)          => apiFetch('/manager/costs?' + new URLSearchParams(params)),
  addCost: (body)             => apiFetch('/manager/costs',       { method: 'POST', body }),
  getEmployees: ()            => apiFetch('/manager/employees'),
  addEmployee: (body)         => apiFetch('/manager/employees',   { method: 'POST', body }),
  updateEmployee: (id, body)  => apiFetch(`/manager/employees/${id}`, { method: 'PUT', body }),
  deleteEmployee: (id)        => apiFetch(`/manager/employees/${id}`, { method: 'DELETE' }),
};
