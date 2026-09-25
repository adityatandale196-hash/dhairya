import { useEffect, useState } from "react";

const STORAGE_KEY = "dhairyaTheme";
const DEFAULT_THEME = "light";

/**
 * Manages the light/dark theme for the entire app.
 * - Reads initial theme from localStorage
 * - Applies it to <html data-theme="...">
 * - Persists changes to localStorage
 */
export function useTheme() {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === "light" || saved === "dark") return saved;
        } catch {
            // ignore
        }
        // Optional: follow system preference on first visit
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return DEFAULT_THEME;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    }, [theme]);

    function toggleTheme() {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }

    return { theme, setTheme, toggleTheme };
}