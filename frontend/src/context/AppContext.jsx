import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { server } from "../main";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    const token = localStorage.getItem("token");

    // Agar token hai hi nahi, toh faltu API call mat karo
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${server}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token"); // Agar token expire/invalid ho toh hata do
    } finally {
      setLoading(false);
    }
  }

  const LogoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged Out");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        LogoutUser,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
