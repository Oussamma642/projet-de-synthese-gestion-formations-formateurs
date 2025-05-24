import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { ContexteProvider } from "./contexts/ContextProvider";
import { BrowserRouter } from "react-router-dom";
import { Router } from "react-router-dom";
import MyAppRoutes from "./router";
import { ThemeProvider } from "./components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")).render(

    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <BrowserRouter>
            <div className="min-h-screen bg-background">
                <ContexteProvider>
                    <MyAppRoutes />
                </ContexteProvider>
            </div>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
);
