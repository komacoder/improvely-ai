import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for better performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
      })
      .catch((registrationError) => {
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
