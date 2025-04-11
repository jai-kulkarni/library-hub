import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/users";

export const registerUser = async (email, firstName, lastName, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register/`, {
            email,
            first_name: firstName,
            last_name: lastName,
            password
        });
        return response.data;
    } catch (error) {
        console.error("Signup Error:", error.response?.data || error.message);
        return false;
    }
};

export const loginUser = async (email, password) => {
    try {
        const payload = { email, password };
        const response = await axios.post(
                `${API_BASE_URL}/login/`, 
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

        const token = response.data.access;
        const user = response.data.user;

        // Store token & user details in localStorage
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        return { token, user };
    } catch (error) {
        console.error("Login failed", error.response?.data || error.message);
        throw error;
    }
};