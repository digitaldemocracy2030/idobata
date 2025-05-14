import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import ContentExplorer from "./components/ContentExplorer";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound"; // 404 page component
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";

// Wrapper component to extract path from URL splat and pass it to ContentExplorer
function ContentExplorerWrapper() {
  const params = useParams();
  // Get the path after /view/. If no path, default to empty string (root)
  const path = params["*"] || "";
  // Use key={path} to force re-render/remount of ContentExplorer when the path changes
  return <ContentExplorer key={path} initialPath={path} />;
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth">
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>
          <Route path="/" element={<Layout />}>
            {/* Route for the repository root */}
            <Route
              index
              element={
                <ProtectedRoute>
                  <ContentExplorer initialPath="" />
                </ProtectedRoute>
              }
            />
            {/* Route for paths within the repository */}
            <Route
              path="view/*"
              element={
                <ProtectedRoute>
                  <ContentExplorerWrapper />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for any other paths (404) */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
