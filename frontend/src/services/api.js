import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getDeadlines: () => api.get('/dashboard/deadlines'),
    getAlerts: () => api.get('/dashboard/alerts'),
    getActivity: () => api.get('/dashboard/activity'),
};

// Subjects API
export const subjectsAPI = {
    getAll: () => api.get('/subjects'),
    getOne: (id) => api.get(`/subjects/${id}`),
    create: (data) => api.post('/subjects', data),
    update: (id, data) => api.put(`/subjects/${id}`, data),
    delete: (id) => api.delete(`/subjects/${id}`),
    createTopic: (subjectId, data) => api.post(`/subjects/${subjectId}/topics`, data),
    updateTopic: (topicId, data) => api.put(`/subjects/topics/${topicId}`, data),
};

// Assignments API
export const assignmentsAPI = {
    getAll: (params) => api.get('/assignments', { params }),
    getOne: (id) => api.get(`/assignments/${id}`),
    create: (data) => api.post('/assignments', data),
    update: (id, data) => api.put(`/assignments/${id}`, data),
    delete: (id) => api.delete(`/assignments/${id}`),
};

// Tests API
export const testsAPI = {
    getAll: (params) => api.get('/tests', { params }),
    getOne: (id) => api.get(`/tests/${id}`),
    getAnalytics: (params) => api.get('/tests/analytics', { params }),
    create: (data) => api.post('/tests', data),
    update: (id, data) => api.put(`/tests/${id}`, data),
    delete: (id) => api.delete(`/tests/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getAll: (params) => api.get('/attendance', { params }),
    getOne: (id) => api.get(`/attendance/${id}`),
    getSummary: () => api.get('/attendance/summary'),
    create: (data) => api.post('/attendance', data),
    update: (id, data) => api.put(`/attendance/${id}`, data),
    delete: (id) => api.delete(`/attendance/${id}`),
};

// Fees API
export const feesAPI = {
    getAll: (params) => api.get('/fees', { params }),
    getOne: (id) => api.get(`/fees/${id}`),
    getSummary: () => api.get('/fees/summary'),
    create: (data) => api.post('/fees', data),
    update: (id, data) => api.put(`/fees/${id}`, data),
    delete: (id) => api.delete(`/fees/${id}`),
};

// Events API
export const eventsAPI = {
    getAll: () => api.get('/events'),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

// Awards API
export const awardsAPI = {
    getAll: () => api.get('/awards'),
    getOne: (id) => api.get(`/awards/${id}`),
    create: (data) => api.post('/awards', data),
    update: (id, data) => api.put(`/awards/${id}`, data),
    delete: (id) => api.delete(`/awards/${id}`),
};

// Activities API
export const activitiesAPI = {
    getAll: () => api.get('/activities'),
    getOne: (id) => api.get(`/activities/${id}`),
    create: (data) => api.post('/activities', data),
    update: (id, data) => api.put(`/activities/${id}`, data),
    delete: (id) => api.delete(`/activities/${id}`),
};

// Notes API
export const notesAPI = {
    getAll: () => api.get('/notes'),
    getOne: (id) => api.get(`/notes/${id}`),
    create: (data) => api.post('/notes', data),
    update: (id, data) => api.put(`/notes/${id}`, data),
    delete: (id) => api.delete(`/notes/${id}`),
};

export default api;
