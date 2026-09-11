import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";

import Home from "./pages/Home";
import Popular from "./pages/Popular";
import ToggleColorMode from "./contexts/ToggleColorMode";
import Server from "./pages/Server";
import EditProfile from "./pages/EditProfile";
import Login from "./pages/userAuthPages/Login";
import Signup from "./pages/userAuthPages/Signup";
import ForgotPassword from "./pages/userAuthPages/Forget";
import ResetPassword from "./pages/userAuthPages/Reset";
import { UserAuthProvider } from "./services/providers/UserAuthProvider";
import { ServerProvider } from "./services/providers/ServerProvider";
import { UserServerProvider } from "./services/providers/UserServerProvider";
import EditServer from "./pages/EditServer";
import ProtectedRoute from "./services/ProtectedRoute";
import ServerOwnerProtectedRoute from "./services/ServerOwnerProtectedRoute";
import AddServer from "./pages/AddServer";
import { CategoriesProvider } from "./services/providers/CatgoryProvider";
import { MessagesProvider } from "./services/providers/MessagesProvider";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter(
	createRoutesFromElements(
		<>
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/forgot" element={<ForgotPassword />} />
			<Route path="/reset/:uid/:token" element={<ResetPassword />} />
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				}
				errorElement={<ErrorPage />}
			/>
			<Route
				path="/profile/edit/"
				element={<EditProfile />}
				errorElement={<ErrorPage />}
			/>
			<Route
				path="/server/:serverId/:channelId?"
				element={
					<ProtectedRoute>
						<Server />
					</ProtectedRoute>
				}
				errorElement={<ErrorPage />}
			/>
			<Route
				path="/server/:serverId/edit"
				element={
					<ServerOwnerProtectedRoute>
						<EditServer />
					</ServerOwnerProtectedRoute>
				}
				errorElement={<ErrorPage />}
			/>
			<Route
				path="/explore/:categoryName"
				element={
					<ProtectedRoute>
						<Popular />
					</ProtectedRoute>
				}
				errorElement={<ErrorPage />}
			/>
			<Route
				path="/add_server"
				element={
					<ProtectedRoute>
						<AddServer />
					</ProtectedRoute>
				}
				errorElement={<ErrorPage />}
			/>
			{/* Catch-all route for 404s */}
			<Route
				path="*"
				element={
					<ErrorPage error={{ status: 404, message: "Page not found" }} />
				}
			/>
		</>
	)
);

const App: React.FC = () => {
	return (
		<>
			<UserAuthProvider>
				<CategoriesProvider>
					<MessagesProvider>
						<ServerProvider>
							<UserServerProvider>
								<ToggleColorMode>
									<RouterProvider router={router} />
								</ToggleColorMode>
							</UserServerProvider>
						</ServerProvider>
					</MessagesProvider>
				</CategoriesProvider>
			</UserAuthProvider>
		</>
	);
};

export default App;
