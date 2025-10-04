import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: "Bearer " + token } } : {};
}

// --- AUTH ---
export async function register(user) {
  return (await axios.post(`${API_BASE}/api/auth/register`, user)).data;
}
export async function login(creds) {
  return (await axios.post(`${API_BASE}/api/auth/login`, creds)).data;
}
export async function me() {
  return (await axios.get(`${API_BASE}/api/auth/me`, authHeaders())).data;
}

// --- REPORTS ---
export async function fetchReports(q) {
  let url = `${API_BASE}/api/reports`;
  if (q) url += "?q=" + encodeURIComponent(q);
  return (await axios.get(url, authHeaders())).data;
}

export async function createReport(body) {
  return (await axios.post(`${API_BASE}/api/reports`, body, authHeaders())).data;
}

export async function fetchTotals() {
  return (await axios.get(`${API_BASE}/api/reports/totals`, authHeaders())).data;
}

export function exportReportsUrl() {
  return `${API_BASE}/api/reports/export`;
}

// --- COURSES ---
export async function fetchCourses() {
  return (await axios.get(`${API_BASE}/api/courses`, authHeaders())).data;
}
export async function createCourse(body) {
  return (await axios.post(`${API_BASE}/api/courses`, body, authHeaders())).data;
}
export async function updateCourse(id, body) {
  return (await axios.put(`${API_BASE}/api/courses/${id}`, body, authHeaders())).data;
}
export async function deleteCourse(id) {
  return (await axios.delete(`${API_BASE}/api/courses/${id}`, authHeaders())).data;
}

// --- CLASSES ---
export async function fetchClasses() {
  return (await axios.get(`${API_BASE}/api/classes`, authHeaders())).data;
}
export async function createClass(body) {
  return (await axios.post(`${API_BASE}/api/classes`, body, authHeaders())).data;
}
export async function updateClass(id, body) {
  return (await axios.put(`${API_BASE}/api/classes/${id}`, body, authHeaders())).data;
}
export async function deleteClass(id) {
  return (await axios.delete(`${API_BASE}/api/classes/${id}`, authHeaders())).data;
}

// --- USERS ---
export async function fetchUsers() {
  return (await axios.get(`${API_BASE}/api/users`, authHeaders())).data;
}
