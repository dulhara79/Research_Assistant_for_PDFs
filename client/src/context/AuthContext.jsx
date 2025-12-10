import { createContext, useState, useEffect, useContext } from "react";
import api from "../context/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
//         console.log("[DEBUG] User data fetched:", data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        }
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // localStorage.setItem("token", data.access_token);
    // await checkUserLoggedIn();
  };

  const register = async (userData) => {
    await api.post("/auth/register", userData);
//     console.log(`[DEBUG] Registered user Data: ${userData}`);
    // await login(userData.email, userData.password);
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
//     console.log(`[DEBUG] Verified OTP for data: ${data}`);
    localStorage.setItem("token", data.access_token);
    await checkUserLoggedIn(); 
    navigate("/chat"); 
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a safe default so components don't crash if AuthProvider
    // isn't mounted (helps during dev or mis-wiring of providers)
    return {
      user: null,
      loading: true,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      verifyOtp: async () => {},
    };
  }
  return ctx;
};
