import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign ResizeObserver loop warning errors
if (typeof window !== 'undefined') {
  const originalError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    if (
      msgStr.includes('ResizeObserver') || 
      msgStr.includes('Script error') ||
      msgStr.toLowerCase().includes('script error')
    ) {
      return true; // prevent default firing of window error reporting
    }
    if (originalError) {
      return originalError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msgStr = reason && reason.message ? String(reason.message) : '';
    if (msgStr.includes('ResizeObserver') || msgStr.includes('Script error')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
