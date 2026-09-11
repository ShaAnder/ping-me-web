import { useState } from "react";

interface ErrorState {
	status?: number;
	message?: string;
}

export const useError = () => {
	const [error, setError] = useState<ErrorState | null>(null);

	const handleError = (err: unknown) => {
		const axiosError = err as {
			response?: { status?: number; data?: { message?: string } };
			message?: string;
		};

		if (axiosError.response?.status) {
			setError({
				status: axiosError.response.status,
				message: axiosError.response.data?.message || axiosError.message,
			});
		} else {
			setError({
				status: 500,
				message: axiosError.message || "An unexpected error occurred",
			});
		}
	};

	const clearError = () => setError(null);

	return { error, handleError, clearError };
};
