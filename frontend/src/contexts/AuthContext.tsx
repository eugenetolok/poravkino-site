import { createContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  role: "admin" | "accountant" | "partner" | "monitoring";
  partner_id?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // Add isLoading state
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialize as true

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.id,
            role: decoded.role,
            partner_id: decoded.partner_id,
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false); // Set loading to false after check is complete
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    const decoded: any = jwtDecode(token);

    setUser({
      id: decoded.id,
      role: decoded.role,
      partner_id: decoded.partner_id,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
