import { useState, useCallback, useRef, useEffect } from 'react';
import { uid } from '../utils';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id));
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = uid();
    setToasts(ts => [...ts, { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
      delete timeoutsRef.current[id];
    }, 4000);
    timeoutsRef.current[id] = timer;
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
    };
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return { toasts, toast, removeToast };
}
