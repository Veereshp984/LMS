import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubjectOverview from "./pages/SubjectOverview";
import VideoPage from "./pages/VideoPage";
import Profile from "./pages/Profile";
import AuthGuard from "./components/Auth/AuthGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/subjects/:subjectId"
        element={
          <AuthGuard>
            <SubjectOverview />
          </AuthGuard>
        }
      />
      <Route
        path="/subjects/:subjectId/video/:videoId"
        element={
          <AuthGuard>
            <VideoPage />
          </AuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
