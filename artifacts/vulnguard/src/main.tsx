import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
	interface Window {
		__VULNGUARD_SUPABASE__?: {
			url?: string;
			anonKey?: string;
		};
	}
}

// Suppress MetaMask connection errors (extension trying to inject code)
window.addEventListener('error', (event) => {
	if (event.message?.includes('MetaMask') || event.filename?.includes('chrome-extension')) {
		event.preventDefault();
	}
}, true);

window.__VULNGUARD_SUPABASE__ = {
	url: import.meta.env.VITE_SUPABASE_URL,
	anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

createRoot(document.getElementById("root")!).render(<App />);
