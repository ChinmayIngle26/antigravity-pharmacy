import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const chatWithAgent = async (message, threadId = "default") => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat`, {
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
    const response = await axios.get(`${API_BASE_URL}/inventory`);
    return response.data;
};

export const getOrderHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
};

export const getAlerts = async () => {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data.alerts; // Expecting list of strings
};
