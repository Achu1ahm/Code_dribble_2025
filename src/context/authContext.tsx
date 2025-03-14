import { createContext, useState, ReactNode, useEffect } from "react";

// Define Auth Context Type
interface AuthContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(
    localStorage.getItem("user") || null
  );

  // Login function
  const login = (roomId: string) => {
    if(roomId == "999"){
      setUser("admin"); // Hardcoded user for now
    }else{
      setUser("mark");
    }
    
    localStorage.setItem("user", roomId); // Persist user
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {console.log(user);
   }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

