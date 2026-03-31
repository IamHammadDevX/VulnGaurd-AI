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

window.__VULNGUARD_SUPABASE__ = {
	url: import.meta.env.VITE_SUPABASE_URL,
	anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

createRoot(document.getElementById("root")!).render(<App />);
