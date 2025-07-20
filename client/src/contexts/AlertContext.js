import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add alert
  const addAlert = (message, severity = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = {
      id,
      message,
      severity, // 'error', 'warning', 'info', 'success'
      timeout
    };

    setAlerts(prevAlerts => [...prevAlerts, newAlert]);

    // Auto remove alert after timeout
    if (timeout > 0) {
      setTimeout(() => removeAlert(id), timeout);
    }

    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Convenience methods for different alert types
  const setError = (message, timeout = 5000) => addAlert(message, 'error', timeout);
  const setWarning = (message, timeout = 5000) => addAlert(message, 'warning', timeout);
  const setInfo = (message, timeout = 5000) => addAlert(message, 'info', timeout);
  const setSuccess = (message, timeout = 5000) => addAlert(message, 'success', timeout);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        clearAlerts,
        setError,
        setWarning,
        setInfo,
        setSuccess
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};