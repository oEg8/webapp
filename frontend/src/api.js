import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const fetchOfferings = () => axios.get(`${API_BASE}/offerings/`).then((res) => res.data.offerings || []);

export const fetchRequests = () => axios.get(`${API_BASE}/requests/`).then((res) => res.data.requests || []);

export const createRequest = (payload) =>
  axios.post(`${API_BASE}/requests/`, payload, { headers: { "Content-Type": "application/json" } }).then((res) => res.data);

export const updateRequest = (id, payload) =>
  axios.patch(`${API_BASE}/requests/${id}/`, payload, { headers: { "Content-Type": "application/json" } }).then((res) => res.data);
