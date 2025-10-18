import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/styles";
import theme from "./theme/theme";
import CssBaseline from "@mui/material/CssBaseline";

// Import the Redux store
import { store } from "./app/store";

// Import the main App component
import App from "./App";

// Import basic CSS
import "./index.css";

// Import and Register Service Workers
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
serviceWorkerRegistration.register();

// Create a root and render the app
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
