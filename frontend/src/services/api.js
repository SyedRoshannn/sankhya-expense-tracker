import axios from 'axios';

// Set default endpoint base URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Match backend running port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token if exists
API.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
