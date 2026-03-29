/**
 * api.ts — Capa de comunicación con el backend (API REST)
 *
 * Servicios:
 *  authService  → Login, registro, logout
 *  dataService  → Universidades, materias, temas, ejercicios, chat, progreso
 *  adminService → Crear materias, temas, nodos, ejercicios, teórico
 */
const API_URL = "/api";

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Login fallido"); }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  async register(email: string, password: string, name: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Registro fallido"); }
    return res.json();
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

export const dataService = {
  // ── Universidades ──
  async getUniversities() {
    const res = await fetch(`${API_URL}/universities`);
    return res.json();
  },

  // ── Materias ──
  async getSubjectsByUniversity(universityId: string) {
    const res = await fetch(`${API_URL}/universities/${universityId}/subjects`);
    return res.json();
  },

  async getSubjects() {
    const res = await fetch(`${API_URL}/subjects`);
    return res.json();
  },

  // ── Temas (Roadmap) ──
  async getTopics(subjectId: string) {
    const res = await fetch(`${API_URL}/subjects/${subjectId}/topics`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  // ── Teórico ──
  async getTopicTheory(topicId: string) {
    const res = await fetch(`${API_URL}/topics/${topicId}/theory`);
    return res.json();
  },

  // ── Nodos de ejercicios ──
  async getExerciseNodes(topicId: string) {
    const res = await fetch(`${API_URL}/topics/${topicId}/nodes`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  // ── Ejercicios ──
  async getExercises(nodeId: string) {
    const res = await fetch(`${API_URL}/nodes/${nodeId}/exercises`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  async getExercise(exerciseId: string) {
    const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  async completeExercise(exerciseId: string) {
    const res = await fetch(`${API_URL}/exercises/${exerciseId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      }
    });
    return res.json();
  },

  // ── Chat por ejercicio ──
  async sendExerciseChat(exerciseId: string, message: string) {
    const res = await fetch(`${API_URL}/exercises/${exerciseId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  },

  // ── Progreso por materia ──
  async getSubjectProgress(subjectId: string) {
    const res = await fetch(`${API_URL}/user/progress/${subjectId}`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  // ── Dashboard ──
  async getDashboard() {
    const res = await fetch(`${API_URL}/user/dashboard`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },
};

export const adminService = {
  async createSubject(data: any) {
    const res = await fetch(`${API_URL}/admin/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createTopic(data: any) {
    const res = await fetch(`${API_URL}/admin/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createNode(data: any) {
    const res = await fetch(`${API_URL}/admin/nodes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createExercise(data: any) {
    const res = await fetch(`${API_URL}/admin/exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTopicTheory(topicId: string, data: { content: string; tips: string }) {
    const res = await fetch(`${API_URL}/admin/topics/${topicId}/theory`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
