import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "../services/useTheme";
import { clearToken } from "../services/api";
import "./About.css";

function About() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    function handleLogout() {
        if (window.confirm("Log out of Dhairya?")) {
            clearToken();
            navigate("/login");
        }
    }

    return (
        <div className="about-page">
            <main className="about-body">

                <Link to="/" className="about-back">← Back</Link>

                <h1 className="about-title">About Dhairya</h1>
                <p className="about-tagline">Your Safety, Our Priority</p>

                {/* Account section */}
                <section className="about-section">
                    <h2 className="about-section-title">Account</h2>

                    <div className="about-row">
                        <span className="about-label">Name</span>
                        <span className="about-value">{user.name}</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Email</span>
                        <span className="about-value">{user.email}</span>
                    </div>

                    {user.phone && (
                        <div className="about-row">
                            <span className="about-label">Phone</span>
                            <span className="about-value">{user.phone}</span>
                        </div>
                    )}
                </section>

                {/* Appearance */}
                <section className="about-section">
                    <h2 className="about-section-title">Appearance</h2>

                    <button className="about-row about-row-btn" onClick={toggleTheme}>
                        <span className="about-label">Theme</span>
                        <span className="about-value">
                            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                        </span>
                    </button>
                </section>

                {/* About text */}
                <section className="about-section">
                    <h2 className="about-section-title">What is Dhairya?</h2>
                    <p className="about-text">
                        Dhairya is a personal safety app that helps you stay connected
                        with your trusted circle during emergencies and travel. It
                        includes SOS alerts, smart safety checks, safe travel tracking,
                        live location sharing, a fake call feature, and an emergency
                        siren.
                    </p>

                    <div className="about-row">
                        <span className="about-label">Version</span>
                        <span className="about-value">1.0.0</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Emergency</span>
                        <a className="about-value about-link" href="tel:112">
                            Call 112
                        </a>
                    </div>
                </section>

                {/* Logout */}
                <section className="about-section">
                    <button className="about-logout" onClick={handleLogout}>
                        Log out
                    </button>
                </section>

                <div className="about-footer">
                    Dhairya © 2026 · Mumbai University
                    <br />
                    Full Stack Java Mini Project
                </div>

            </main>
        </div>
    );
}

export default About;