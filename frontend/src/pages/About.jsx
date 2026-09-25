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

                <div className="about-hero">
                    <h1 className="about-title">Dhairya</h1>
                    <p className="about-tagline">Your Safety, Our Priority</p>
                    <p className="about-hero-sub">
                        Smart Women's Safety & Travel Companion
                    </p>
                </div>

                {/* Account */}
                <section className="about-section">
                    <h2 className="about-section-title">👤 Account</h2>

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
                    <h2 className="about-section-title">🎨 Appearance</h2>

                    <button className="about-row about-row-btn" onClick={toggleTheme}>
                        <span className="about-label">Theme</span>
                        <span className="about-value">
                            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                        </span>
                    </button>
                </section>

                {/* About the app */}
                <section className="about-section">
                    <h2 className="about-section-title">ℹ️ About Dhairya</h2>
                    <p className="about-text">
                        Dhairya is a personal safety app designed for women to stay
                        connected with their trusted circle during emergencies and
                        travel. It combines instant SOS alerts, smart safety checks,
                        safe travel tracking, live location sharing, and emergency
                        tools into one simple experience.
                    </p>
                </section>

                {/* Features */}
                <section className="about-section">
                    <h2 className="about-section-title">✨ Key Features</h2>

                    <div className="about-feature">
                        <span className="about-feature-icon">🛡️</span>
                        <div>
                            <div className="about-feature-title">Smart Safety Check</div>
                            <div className="about-feature-text">
                                Periodic check-ins with automatic escalation to contacts
                            </div>
                        </div>
                    </div>

                    <div className="about-feature">
                        <span className="about-feature-icon">🚗</span>
                        <div>
                            <div className="about-feature-title">Safe Travel Mode</div>
                            <div className="about-feature-text">
                                Track your journey and confirm safe arrival
                            </div>
                        </div>
                    </div>

                    <div className="about-feature">
                        <span className="about-feature-icon">📍</span>
                        <div>
                            <div className="about-feature-title">Live Location</div>
                            <div className="about-feature-text">
                                Share real-time location with your trusted circle
                            </div>
                        </div>
                    </div>

                    <div className="about-feature">
                        <span className="about-feature-icon">🆘</span>
                        <div>
                            <div className="about-feature-title">Auto Alerts (SMS + Email)</div>
                            <div className="about-feature-text">
                                Emergency notifications to trusted contacts with location
                            </div>
                        </div>
                    </div>

                    <div className="about-feature">
                        <span className="about-feature-icon">📞</span>
                        <div>
                            <div className="about-feature-title">Fake Call</div>
                            <div className="about-feature-text">
                                Realistic incoming call to escape uncomfortable situations
                            </div>
                        </div>
                    </div>

                    <div className="about-feature">
                        <span className="about-feature-icon">🔊</span>
                        <div>
                            <div className="about-feature-title">Emergency Siren</div>
                            <div className="about-feature-text">
                                Loud alarm and screen flash to attract attention
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech stack */}
                <section className="about-section">
                    <h2 className="about-section-title">⚙️ Tech Stack</h2>

                    <div className="about-tech-group">
                        <div className="about-tech-group-label">Frontend</div>
                        <div className="about-tech-chips">
                            <span className="about-chip">React 18</span>
                            <span className="about-chip">Vite</span>
                            <span className="about-chip">React Router</span>
                            <span className="about-chip">CSS Variables</span>
                            <span className="about-chip">PWA</span>
                        </div>
                    </div>

                    <div className="about-tech-group">
                        <div className="about-tech-group-label">Backend</div>
                        <div className="about-tech-chips">
                            <span className="about-chip">Java 17</span>
                            <span className="about-chip">Spring Boot 3</span>
                            <span className="about-chip">Spring Security</span>
                            <span className="about-chip">JPA / Hibernate</span>
                            <span className="about-chip">JavaMailSender</span>
                        </div>
                    </div>

                    <div className="about-tech-group">
                        <div className="about-tech-group-label">Database</div>
                        <div className="about-tech-chips">
                            <span className="about-chip">PostgreSQL</span>
                        </div>
                    </div>

                    <div className="about-tech-group">
                        <div className="about-tech-group-label">Integrations</div>
                        <div className="about-tech-chips">
                            <span className="about-chip">CircuitDigest SMS API</span>
                            <span className="about-chip">Gmail SMTP</span>
                            <span className="about-chip">Google Maps Links</span>
                            <span className="about-chip">Web Geolocation</span>
                        </div>
                    </div>

                    <div className="about-tech-group">
                        <div className="about-tech-group-label">Deployment</div>
                        <div className="about-tech-chips">
                            <span className="about-chip">Vercel</span>
                            <span className="about-chip">Render</span>
                            <span className="about-chip">Docker</span>
                            <span className="about-chip">GitHub</span>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="about-section">
                    <h2 className="about-section-title">👥 Our Team</h2>

                    <div className="about-team-member">
                        <div className="about-team-avatar">AT</div>
                        <div>
                            <div className="about-team-name">Aditya Tandale</div>
                            <div className="about-team-role">Full Stack Development</div>
                        </div>
                    </div>

                    <div className="about-team-member">
                        <div className="about-team-avatar">AS</div>
                        <div>
                            <div className="about-team-name">Ayush Shinde</div>
                            <div className="about-team-role">Backend & Database</div>
                        </div>
                    </div>

                    <div className="about-team-member">
                        <div className="about-team-avatar">DS</div>
                        <div>
                            <div className="about-team-name">Dnyaneshwar Shingate</div>
                            <div className="about-team-role">Frontend & UI</div>
                        </div>
                    </div>

                    <div className="about-team-member">
                        <div className="about-team-avatar">RS</div>
                        <div>
                            <div className="about-team-name">Rahul Sumbe</div>
                            <div className="about-team-role">Testing & Documentation</div>
                        </div>
                    </div>
                </section>

                {/* Project info */}
                <section className="about-section">
                    <h2 className="about-section-title">🎓 Project Details</h2>

                    <div className="about-row">
                        <span className="about-label">Institution</span>
                        <span className="about-value">Mumbai University</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Course</span>
                        <span className="about-value">B.E. Information Technology</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Year</span>
                        <span className="about-value">Second Year</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Subject</span>
                        <span className="about-value">Full Stack Java Mini Project</span>
                    </div>

                    <div className="about-row">
                        <span className="about-label">Version</span>
                        <span className="about-value">1.0.0</span>
                    </div>
                </section>

                {/* Emergency */}
                <section className="about-section">
                    <h2 className="about-section-title">📞 Emergency</h2>

                    <a className="about-emergency" href="tel:112">
                        <span className="about-emergency-icon">🚨</span>
                        <div>
                            <div className="about-emergency-title">Call 112</div>
                            <div className="about-emergency-text">
                                National Emergency Number (India)
                            </div>
                        </div>
                    </a>
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