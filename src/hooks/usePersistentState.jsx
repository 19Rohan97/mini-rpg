import { useState, useEffect } from "react";

/**
 * Custom hook to persist state to localStorage
 * @param {string} key - localStorage key
 * @param {*} defaultValue - default value if none is found
 */
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (err) {
      console.error("Error reading localStorage key:", key, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error("Error saving to localStorage:", key, err);
    }
  }, [key, state]);

  return [state, setState];
}
