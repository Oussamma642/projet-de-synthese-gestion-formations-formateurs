import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext({
  user: null,
  token: null,
  notification: null,
  setUser: () => {},
  setToken: () => {},
  setNotification: ()=>{}
});

export const ContexteProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, _setUser] = useState(() => {
    const savedUser = localStorage.getItem("USER_DATA");
    return savedUser ? JSON.parse(savedUser) : {};
  });
  
  const [notification, _setNotification] = useState("");
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

  // Custom setUser function that also stores in localStorage
  const setUser = (userData) => {
    _setUser(userData);
    if (userData && Object.keys(userData).length) {
      localStorage.setItem("USER_DATA", JSON.stringify(userData));
      // Also store role separately for easier access
      if (userData.role) {
        localStorage.setItem("acteur", userData.role);
      }
    } else {
      localStorage.removeItem("USER_DATA");
      localStorage.removeItem("acteur");
    }
  };

  const setNotification = (message)=>{
    _setNotification(message);
    setTimeout(()=>{
      _setNotification('');
    }, 5000);
  }

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
      // Also clear user data on logout
      setUser({});
    }
  };

  // On component mount, double check if user and token match
  useEffect(() => {
    const savedToken = localStorage.getItem("ACCESS_TOKEN");
    const savedUser = localStorage.getItem("USER_DATA");
    const savedRole = localStorage.getItem("acteur");
    
    // If we have token but no user, try to restore from localStorage
    if (savedToken && (!user || Object.keys(user).length === 0) && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      _setUser(parsedUser);
    }
    
    // Make sure role is consistent
    if (user && user.role && !savedRole) {
      localStorage.setItem("acteur", user.role);
    }
  }, [user]);

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        setToken,
        setUser,
        notification,
        setNotification,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
