import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPwa } from './lib/pwa'

// Capture the install prompt + register the service worker as early as possible
initPwa();

createRoot(document.getElementById("root")!).render(<App />);
