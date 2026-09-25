import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearToken } from "../services/api";
import { useTheme } from "../services/useTheme";
import "../App.css";
import dhairyaLogo from "../assets/logo.png";

const features = [
    { icon: "🛡️", title: "Safety Check", text: "Check your safety", path: "/safety-check" },
    { icon: "🚗", title: "Safe Travel", text: "Track your journey", path: "/safe-travel" },
    { icon: "📍", title: "Live Location", text: "Share your location", path: null },
    { icon: "👥", title: "Trusted Circle", text: "Your trusted people", path: "/contacts" },
    { icon: "📞", title: "Fake Call", text: "Get a simulated call", path: "/fake-call" },
    { icon: "🔊", title: "Emergency Siren", text: "Activate siren", path: "/siren" },
];

function Home() {
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const { theme, toggleTheme } = useTheme();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    function handleLogout() {
        clearToken();
        navigate("/login");
    }

    function handleSosTap() {
        if (confirming) return;
        setConfirming(true);
        setHoldProgress(0);

        const start = Date.now();
        const duration = 5000;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(100, (elapsed / duration) * 100);
            setHoldProgress(pct);
            if (pct >= 100) {
                clearInterval(interval);
                setConfirming(false);
                setHoldProgress(0);
                navigate("/sos");
            }
        }, 50);

        window.__sosInterval = interval;
    }

    function handleSosCancel() {
        if (window.__sosInterval) {
            clearInterval(window.__sosInterval);
            window.__sosInterval = null;
        }
        setConfirming(false);
        setHoldProgress(0);
    }

    return (
        <div className="app">

            {/* Header */}
            <header className="top-bar">
                <div className="brand">
                    <img src={dhairyaLogo} alt="Dhairya Logo" className="brand-logo" />
                    <div>
                        <h1>Dhairya</h1>
                        <p>Hi, {user.name}</p>
                    </div>
                </div>

                <div className="top-bar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="home-container">

                <section className="welcome-card">
                    <img src={dhairyaLogo} alt="Dhairya Logo" className="welcome-logo" />
                    <p className="small-text">Welcome to Dhairya</p>
                    <h2>
                        Stay Safe.
                        <br />
                        Stay Connected.
                    </h2>
                    <p className="welcome-description">
                        Smart safety support for emergencies and travel.
                    </p>
                </section>

                {/* SOS Button */}
                <section className="sos-section">
                    {!confirming && (
                        <button className="sos-button" onClick={handleSosTap}>
                            <span className="sos-icon">!</span>
                            <span>SOS</span>
                            <small>Emergency</small>
                        </button>
                    )}

                    {confirming && (
                        <div className="sos-confirm-box">
                            <p className="sos-confirm-text">
                                ⚠️ Sending SOS in 5 seconds
                            </p>
                            <div className="sos-progress-bar">
                                <div
                                    className="sos-progress-fill"
                                    style={{ width: `${holdProgress}%` }}
                                />
                            </div>
                            <button className="sos-cancel-btn" onClick={handleSosCancel}>
                                Cancel
                            </button>
                        </div>
                    )}
                </section>

                {/* Features */}
                <section className="feature-grid">
                    {features.map((f) => (
                        <button
                            className="feature-card"
                            key={f.title}
                            onClick={() => f.path && navigate(f.path)}
                        >
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </button>
                    ))}
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button onClick={() => navigate("/")}>
                    <span>⌂</span>
                    <small>Home</small>
                </button>

                <button>
                    <span>📍</span>
                    <small>Location</small>
                </button>

                <button className="nav-sos" onClick={handleSosTap}>
                    <span>!</span>
                </button>

                <button onClick={() => navigate("/contacts")}>
                    <span>👥</span>
                    <small>Contacts</small>
                </button>

                <button>
                    <span>⚙️</span>
                    <small>Settings</small>
                </button>
            </nav>

        </div>
    );
}

export default Home;