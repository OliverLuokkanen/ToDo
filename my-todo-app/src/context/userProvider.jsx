import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext(null);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, token } tai null

  // Lataa käyttäjä sessionStoragesta kun sovellus käynnistyy
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      sessionStorage.removeItem("user");
    }
  }, []);

  // Kirjautuminen – kutsutaan signinissä
  const login = (userData) => {
    // esim. { id, email, token }
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Uloskirjautuminen – Logout-nappi kutsuu tätä
  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const value = { user, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook, jota käytetään komponenteissa
export const useUser = () => useContext(UserContext);