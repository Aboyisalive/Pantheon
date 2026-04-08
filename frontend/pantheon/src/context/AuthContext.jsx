import { createContext, useContext, useState, useCallback } from "react";
import { getToken, getUser, clearToken, setToken, setUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());

  const signIn = useCallback((tokenData, userData) => {
    setToken(tokenData);
    setUser(userData);
    setTokenState(tokenData);
    setUserState(userData);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
