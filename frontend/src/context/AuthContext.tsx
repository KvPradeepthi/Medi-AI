import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../services/api";
import { IUser } from "../types";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, googleToken?: string) => Promise<IUser>;
  registerPatient: (data: any) => Promise<IUser>;
  registerDoctor: (data: any) => Promise<IUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("mediai_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      logger.error("Failed to load user profile", err);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password?: string, googleToken?: string): Promise<IUser> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password, googleToken });
      const { user: loggedUser, token: authToken } = response.data;
      
      localStorage.setItem("mediai_token", authToken);
      setToken(authToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || error.message || "Login failed";
    }
  };

  const registerPatient = async (data: any): Promise<IUser> => {
    setIsLoading(true);
    try {
      const response = await authAPI.registerPatient(data);
      const { user: registeredUser, token: authToken } = response.data;
      
      localStorage.setItem("mediai_token", authToken);
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || error.message || "Registration failed";
    }
  };

  const registerDoctor = async (data: any): Promise<IUser> => {
    setIsLoading(true);
    try {
      const response = await authAPI.registerDoctor(data);
      const { user: registeredUser, token: authToken } = response.data;
      
      // If doctor is pending admin approval, we don't automatically log them in
      if (registeredUser.status === "pending") {
        setIsLoading(false);
        return registeredUser;
      }
      
      localStorage.setItem("mediai_token", authToken);
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || error.message || "Doctor registration failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("mediai_token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerPatient,
        registerDoctor,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock simple logger to avoid typescript imports warning
const logger = {
  error: (msg: string, err: any) => console.error(msg, err)
};
