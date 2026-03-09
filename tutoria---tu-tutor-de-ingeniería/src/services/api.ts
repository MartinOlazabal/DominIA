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
  async getDashboard() {
    const res = await fetch(`${API_URL}/user/dashboard`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    return res.json();
  },

  // Obtiene todas las materias con sus instancias/categorías
  async getSubjects() {
    const res = await fetch(`${API_URL}/subjects`);
    return res.json();
  },

  // Envía un mensaje al tutor IA con el contexto de materia e instancia
  async sendMessage(message: string, subjectId: string, categoryId: string) {
    console.log('[sendMessage] Enviando:', { message, subjectId, categoryId });
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify({ message, subjectId, categoryId }),
    });
    console.log('[sendMessage] Status respuesta:', res.status);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  },

  // Obtiene el mensaje de bienvenida personalizado al entrar a una instancia.
  // El backend decide si es "primera vez" o "regreso" y genera el mensaje apropiado.
  async getWelcomeMessage(categoryId: string): Promise<{ text: string; isFirstTime: boolean }> {
    const res = await fetch(`${API_URL}/chat/welcome?categoryId=${categoryId}`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    if (!res.ok) {
      // Fallback si falla el endpoint de bienvenida
      return { text: "¡Hola! Estoy listo para ayudarte. ¿Qué te gustaría estudiar hoy?", isFirstTime: true };
    }
    return res.json();
  },

  // Obtiene el progreso del usuario en una instancia específica
  async getProgress(categoryId: string) {
    const res = await fetch(`${API_URL}/progress?categoryId=${categoryId}`, {
      headers: { "Authorization": `Bearer ${authService.getToken()}` }
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Actualiza el progreso del usuario
  async updateProgress(categoryId: string, data: { level?: number; topicsMastered?: string[]; topicsStruggling?: string[] }) {
    const res = await fetch(`${API_URL}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify({ categoryId, ...data })
    });
    return res.json();
  }
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

  async createCategory(data: { name: string; subjectId: string; type?: string; order?: number }) {
    const res = await fetch(`${API_URL}/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async uploadKnowledge(formData: FormData) {
    const res = await fetch(`${API_URL}/admin/upload-knowledge`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authService.getToken()}`
      },
      body: formData,
    });
    return res.json();
  }
};
