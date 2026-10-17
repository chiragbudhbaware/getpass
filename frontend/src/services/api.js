
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAttendees() {
  const response = await api.get("/api/attendees");
  return response.data;
}

export async function createAttendee(data) {
  const response = await api.post("/api/attendees", data);
  return response.data;
}

export async function getStats() {
  const response = await api.get("/api/stats");
  return response.data;
}

export async function checkInAttendee(passCode) {
  const response = await api.post("/api/check-in", {
    pass_code: passCode,
  });
  return response.data;
}

export default api;
