import { SignIn, useAuth } from "@clerk/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  return isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
}

function SignInPage() {
  return (
    <main className="sign-in-page">
      <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}