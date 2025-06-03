// src/services/apiService.js
import axios from 'axios';

// The Vite proxy is configured for '/api'.
// However, the login route in server.js is '/login', not '/api/login'.
// We'll create two clients or adjust the proxy / backend routes.
// For simplicity, let's assume /login is also handled or adjust server.js to put it under /api.
// For this example, we'll call /login directly without /api prefix.
const API_BASE_URL = 'https://fcea-2806-230-4043-c126-7dfb-b81d-b40-eef7.ngrok-free.app'; // deafult http://localhost:3000

const apiClient = axios.create({
  baseURL: '/api', // For routes proxied by Vite
  headers: {
    'Content-Type': 'application/json', // Es buena práctica definirlo explícitamente
    'ngrok-skip-browser-warning': 'true' // ¡Cabecera clave para ngrok! (el valor puede ser cualquiera)
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default {
  login(credentials) {
    return axios.post(`${API_BASE_URL}/login`, credentials, // Llamada directa a ngrok para /login
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      )
      .then(response => response.data);
  },

  getUserDetails(userId) {
    // CORRECTO: Ruta relativa para apiClient, se convertirá en /api/users/:userId
    return apiClient.get(`/users/${userId}`)
      .then(response => { /* ... tu lógica de manejo de respuesta ... */ 
         if (response.data && response.data.success) return response.data.user;
         return null; // o lanzar error
      })
      .catch(error => {
        console.error(`apiService.getUserDetails error for ${userId}:`, error.response ? error.response.data : error.message);
        throw error;
      });
  },

  getPrivateContacts() {
    // CORRECTO: Ruta relativa
    return apiClient.get('/users/contacts') 
      .then(response => { /* ... tu lógica de manejo de respuesta ... */ 
        if (response.data && response.data.success && Array.isArray(response.data.contacts)) {
          return response.data.contacts;
        }
        return [];
      })
      .catch(error => { /* ... tu manejo de error ... */ return []; });
  },

  getMyTeamsAndChannels() {
    // CORRECTO: Ruta relativa
    return apiClient.get('/my-teams-and-channels')
      .then(response => { /* ... tu lógica de manejo de respuesta ... */ 
        if (response.data && response.data.success && Array.isArray(response.data.teams)) {
          return response.data.teams;
        }
        return [];
      })
      .catch(error => { /* ... tu manejo de error ... */ return []; });
  },

  getTeamMembers(teamId) {
    // CORRECTO: Ruta relativa
    return apiClient.get(`/teams/${teamId}/members`)
        .then(response => { /* ... */ if (response.data && response.data.success) return response.data.members; return []; })
        .catch(error => { /* ... */ return []; });
  },

  getOrCreatePrivateChatRoom(recipientId) {
    // CORRECTO: Ruta relativa
    return apiClient.post('/private-chats/room', { recipientId })
        .then(response => { /* ... */ if (response.data && response.data.success) return response.data; throw new Error('Failed'); })
        .catch(error => { /* ... */ throw error; });
  }
};