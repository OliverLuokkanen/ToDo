import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./screens/App.jsx";
import { UserProvider } from "./context/UserProvider.jsx";
import "./index.css"; // jos sinulla on globaali tyylitiedosto, muuten tämän voi poistaa

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);