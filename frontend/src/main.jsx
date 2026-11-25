import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App.jsx";
import { CLERK_KEY } from "./config.js";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {CLERK_KEY ? (
      <ClerkProvider
        publishableKey={CLERK_KEY}
        afterSignOutUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#137f78",
            borderRadius: "0.75rem",
            fontFamily: '"DM Sans", sans-serif',
          },
          elements: {
            card: {
              border: "1px solid #e4ece9",
              boxShadow: "0 16px 40px rgba(27, 65, 58, 0.1)",
            },
            formButtonPrimary: {
              backgroundColor: "#137f78",
              fontWeight: 700,
            },
          },
        }}
      >
        <App />
      </ClerkProvider>
    ) : (
      <p style={{ padding: 24 }}>Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to frontend/.env.local and restart.</p>
    )}
  </React.StrictMode>
);
