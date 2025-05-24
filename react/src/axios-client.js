import axios from "axios";

// Create Axios client with default configuration
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api',  // Directly set the base URL
    timeout: 15000, // Set a reasonable timeout (15 seconds)
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use((config) => {
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`📤 REQUEST: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    // Add auth token
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

// Response interceptor for handling common errors
axiosClient.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📥 RESPONSE: ${response.status} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        // Handle different types of errors
        if (error.response) {
            // Server responded with an error status
            console.error(`Error ${error.response.status}: ${error.response.config.url}`, error.response.data);
            
            // Handle 401 Unauthorized - clear token and user data
            if (error.response.status === 401) {
                localStorage.removeItem("ACCESS_TOKEN");
                localStorage.removeItem("USER_DATA");
                localStorage.removeItem("acteur");
                
                // Don't redirect from the login page
                if (!window.location.pathname.includes('/login')) {
                    // Give the console.error time to be logged before redirecting
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 100);
                }
            }
        } else if (error.request) {
            // Request was made but no response
            console.error('Network Error: No response received', error.request);
        } else {
            // Error setting up request
            console.error('Error setting up request:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;
