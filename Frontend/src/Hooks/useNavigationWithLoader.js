import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationWithLoader = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const navigateWithLoader = (to, options = {}) => {
    setIsNavigating(true);
    
    // Store the scroll position before navigation
    const scrollPosition = window.scrollY;
    
    // Set a timeout to show the loader for at least 1 second
    const timer = setTimeout(() => {
      setIsNavigating(false);
      // Restore scroll position after navigation
      window.scrollTo(0, scrollPosition);
    }, 1000);

    // Navigate to the new route
    navigate(to, {
      ...options,
      onComplete: () => {
        clearTimeout(timer);
        setIsNavigating(false);
        if (options.onComplete) options.onComplete();
      },
      onError: (error) => {
        clearTimeout(timer);
        setIsNavigating(false);
        if (options.onError) options.onError(error);
      }
    });

    // Cleanup function
    return () => clearTimeout(timer);
  };

  return { isNavigating, navigate: navigateWithLoader };
};

export default useNavigationWithLoader;
