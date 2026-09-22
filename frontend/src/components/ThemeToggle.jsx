import { useEffect, useState } from "react";

function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem("dhairyaTheme") || "light");

    useEffect(() => {
        document.body.className = theme === "dark" ? "dark-mode" : "";
        localStorage.setItem("dhairyaTheme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-main)",
                padding: "6px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px"
            }}
            title="Toggle Dark Mode"
        >
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}

export default ThemeToggle;