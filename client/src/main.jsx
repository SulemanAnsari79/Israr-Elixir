import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

// import AuthProvider from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>  
  {/* <StrictMode> */}
    <App />
  {/* </StrictMode> */}
  </GoogleOAuthProvider>
);



 
