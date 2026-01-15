import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://janiyah-hyperorganic-kenton.ngrok-free.dev';

// Axios instance with default headers to bypass ngrok warning
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

export const chatWithAgent = async (message, threadId = "default") => {
    try {
        const response = await api.post(`/chat`, {
            message,
            thread_id: threadId
        });
        return response.data.response;
    } catch (error) {
        console.error("Chat error", error);
        return "Error communicating with the pharmacy agent.";
    }
};

export const getInventory = async () => {
    const response = await api.get(`/inventory`);
    return response.data;
};

export const getOrderHistory = async () => {
    const response = await api.get(`/history`);
    return response.data;
};

export const getAlerts = async () => {
    const response = await api.get(`/alerts`);
    return response.data.alerts; // Expecting list of strings
};

export const uploadPrescription = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post(`/upload-prescription`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Upload error", error);
        return { error: "Failed to upload prescription." };
    }
};
