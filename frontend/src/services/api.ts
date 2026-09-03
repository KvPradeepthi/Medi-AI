import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token into header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mediai_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  registerPatient: (data: any) => api.post("/auth/register-patient", data),
  registerDoctor: (data: any) => api.post("/auth/register-doctor", data),
  login: (data: any) => api.post("/auth/login", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forgot-password", data),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.patch("/users/profile", data),
  getPatientDashboard: () => api.get("/users/patient-dashboard"),
  getAdminDashboard: () => api.get("/users/admin-dashboard"),
  getDoctorsList: (status?: string) => api.get("/users/doctors", { params: { status } }),
  getPatientsList: () => api.get("/users/patients"),
  approveDoctor: (data: { doctorId: string; status: "approved" | "rejected" }) =>
    api.post("/users/approve-doctor", data),
};

export const reportAPI = {
  upload: (formData: FormData) =>
    api.post("/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getHistory: (patientId?: string) =>
    api.get("/reports/history", { params: { patientId } }),
  getDetails: (id: string) => api.get(`/reports/${id}`),
};

export const appointmentAPI = {
  book: (data: any) => api.post("/appointments/book", data),
  getAppointments: () => api.get("/appointments"),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  complete: (id: string) => api.patch(`/appointments/${id}/complete`),
  prescribe: (id: string, data: any) => api.post(`/appointments/${id}/prescribe`, data),
};

export const reminderAPI = {
  add: (data: any) => api.post("/reminders", data),
  get: (patientId?: string) => api.get("/reminders", { params: { patientId } }),
  updateLog: (id: string, data: { date: string; slot: string; status: string }) =>
    api.patch(`/reminders/${id}/log`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

export const chatAPI = {
  getHistory: (receiverId: string) => api.get(`/chats/history/${receiverId}`),
  getRecentContacts: () => api.get("/chats/recent-contacts"),
};

// AI services directly or routed via Node backend gateway
export const aiAPI = {
  chatAssistant: (patientId: string, query: string, mode: string, history: any[]) =>
    axios.post("http://localhost:8000/api/v1/ai/chat", {
      patient_id: patientId,
      query,
      mode,
      history,
    }),
  generateDiet: (data: any) =>
    axios.post("http://localhost:8000/api/v1/ai/diet", data),
  checkSymptoms: (data: { query: string; age: number; gender: string }) =>
    axios.post("http://localhost:8000/api/v1/ai/symptoms", data),
};

export default api;
