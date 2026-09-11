import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		allowedHosts: [
			"pleasantly-quick-seasnail.ngrok-free.app",
			"ping-me-dev.tomeofmanythings.com",
		],
	},
	build: {
		// Optimize bundle splitting
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor libraries
					vendor: ["react", "react-dom"],
					mui: ["@mui/material", "@mui/icons-material", "@mui/system"],
					router: ["react-router-dom"],
					forms: ["formik"],
				},
			},
		},
		// Enable source maps for production debugging while being lighter
		sourcemap: "hidden",
		// Optimize chunk size
		chunkSizeWarningLimit: 1000,
	},
	// Optimize development
	optimizeDeps: {
		include: ["react", "react-dom", "@mui/material", "react-router-dom"],
	},
});
