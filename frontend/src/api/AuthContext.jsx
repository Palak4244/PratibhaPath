// src/api/AuthContext.jsx
// Login state ko manage karta hai. Token localStorage mein store hota hai
// (yeh ek real deployed website hai, browser localStorage yahan bilkul
// normal/safe hai — Claude.ai artifacts wali restriction yahan apply nahi
// hoti, kyunki yeh tumhara apna independent website hai).

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("pp_token") || null);
  const [user, setUser] = useState(
    localStorage.getItem("pp_user") ? JSON.parse(localStorage.getItem("pp_user")) : null
  );

  // Axios ko har request mein automatically token bhejne ke liye configure karo
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  function login(newToken, newUser) {
    localStorage.setItem("pp_token", newToken);
    localStorage.setItem("pp_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setToken(null);
    setUser(null);
  }

  async function register(name, email, password) {
    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    login(data.token, data.user);
  }

  async function signIn(email, password) {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    login(data.token, data.user);
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, register, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
