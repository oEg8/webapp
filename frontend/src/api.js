import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

const jsonHeaders = { "Content-Type": "application/json" };

const withAuth = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const registerUser = (payload) =>
  axios.post(`${API_BASE}/auth/register/`, payload, { headers: jsonHeaders }).then((res) => res.data);

export const loginUser = (payload) =>
  axios.post(`${API_BASE}/auth/login/`, payload, { headers: jsonHeaders }).then((res) => res.data);

export const verifyMfa = (payload) =>
  axios.post(`${API_BASE}/auth/mfa/verify/`, payload, { headers: jsonHeaders }).then((res) => res.data);

export const fetchMe = (token) =>
  axios.get(`${API_BASE}/auth/me/`, { headers: withAuth(token) }).then((res) => res.data);

export const runScan = (token, engine = "nmap") =>
  axios.post(`${API_BASE}/pentest/scan/`, { engine }, { headers: { ...withAuth(token), ...jsonHeaders } }).then((res) => res.data);

export const fetchEngines = () => axios.get(`${API_BASE}/pentest/engines/`).then((res) => res.data.engines || []);

export const fetchScans = (token) =>
  axios.get(`${API_BASE}/pentest/scans/`, { headers: withAuth(token) }).then((res) => res.data.scans || []);
