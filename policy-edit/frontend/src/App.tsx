import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import ContentExplorer from "./components/ContentExplorer";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound"; // 404 page component
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  // In later steps, we might initialize Zustand store here with env variables
  // const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER;
  // const repoName = import.meta.env.VITE_GITHUB_REPO_NAME;
  // console.log(`Repo: ${repoOwner}/${repoName}`);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/verify-email"
            element={<div>メールアドレスを確認中...</div>}
          />
          <Route
            path="/reset-password"
            element={<div>パスワードをリセット中...</div>}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Route for the repository root */}
            <Route index element={<ContentExplorer initialPath="" />} />
            {/* Route for paths within the repository */}
            <Route path="view/*" element={<ContentExplorerWrapper />} />
            {/* Catch-all route for any other paths (404) */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
