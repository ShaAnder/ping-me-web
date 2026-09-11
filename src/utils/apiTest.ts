import axios from "axios";
import { BASE_URL } from "../api/config";

export const testApiEndpoints = async () => {
	const token = localStorage.getItem("access_token");
	console.log("Testing API endpoints...");
	console.log("Token exists:", !!token);

	if (!token) {
		console.log("No access token found");
		return;
	}

	const endpoints = [
		"/api/servers/",
		"/api/account/my_servers/",
		"/api/categories/",
	];

	for (const endpoint of endpoints) {
		try {
			console.log(`Testing ${endpoint}...`);
			const response = await axios.get(`${BASE_URL}${endpoint}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			console.log(`${endpoint} - Status:`, response.status);
			console.log(`${endpoint} - Data type:`, typeof response.data);
			console.log(`${endpoint} - Is Array:`, Array.isArray(response.data));
			console.log(`${endpoint} - Data:`, response.data);
		} catch (error: unknown) {
			const axiosError = error as {
				response?: { status?: number; data?: unknown };
				message?: string;
			};
			console.error(`${endpoint} - Error:`, {
				status: axiosError.response?.status,
				message: axiosError.response?.data,
				error: axiosError.message,
			});
		}
	}
};

// Add to window object for easy console access
declare global {
	interface Window {
		testApiEndpoints: typeof testApiEndpoints;
	}
}
window.testApiEndpoints = testApiEndpoints;
