import { Link } from "react-router-dom";
import dhairyaLogo from "../assets/logo.png"; // ⚠️ MAKE SURE THIS FILE EXISTS
import "./About.css";

const features = [
    {
        icon: "🚨",
        title: "SOS Emergency",
        desc: "One-tap SOS with 5-second countdown, GPS location capture, and instant alerts to trusted contacts via WhatsApp and SMS.",
    },
    {
        icon: "🛡️",
        title: "Smart Safety Check",
        desc: "Periodic check-ins with automatic escalation. Alerts trusted contacts if the user stops responding.",
    },
    {
        icon: "🚗",
        title: "Safe Travel Mode",
        desc: "Journey monitoring with ETA countdown. Sends 3 reminders and alerts contacts if arrival is not confirmed.",
    },
    {
        icon: "📍",
        title: "Live Location Sharing",
        desc: "Instant GPS location sharing with trusted contacts via WhatsApp and SMS with a Google Maps link.",
    },
    {
        icon: "👥",
        title: "Emergency Contacts",
        desc: "Add, edit and delete trusted contacts. Each contact receives alerts during emergencies.",
    },
    {
        icon: "📞",
        title: "Fake Call",
        desc: "Simulated incoming call with ringtone and vibration to help exit uncomfortable situations.",
    },
    {
        icon: "🔊",
        title: "Emergency Siren",
        desc: "Loud audio siren with flashing screen to attract attention in dangerous situations.",
    },
    {
        icon: "📧",
        title: "Automatic Email Alerts",
        desc: "Sends automatic emergency emails to contacts with location link using EmailJS integration.",
    },
];

const techStack = [
    { label: "React (Vite)", color: "purple" },
    { label: "Spring Boot", color: "green" },
    { label: "PostgreSQL", color: "blue" },
    { label: "Spring Data JPA", color: "green" },
    { label: "BCrypt", color: "orange" },
    { label: "EmailJS", color: "purple" },
    { label: "Web Audio API", color: "blue" },
    { label: "Geolocation API", color: "orange" },
    { label: "Vercel", color: "purple" },
    { label: "Render", color: "green" },
    { label: "Git & GitHub", color: "orange" },
    { label: "Postman", color: "orange" },
];

function About() {
    return (
        <div className="about-page">

            <header className="about-header">
                <Link to="/" className="about-back">← Back</Link>
                <h1>About Dhairya</h1>
            </header>

            <main className="about-body">

                {/* Hero */}
                <div className="about-hero">
                    <img src={dhairyaLogo} alt="Dhairya Logo" />
                    <h2>Dhairya</h2>
                    <p>Smart Women's Safety & Travel Companion</p>
                    <p style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                        Your Safety, Our Priority
                    </p>
                </div>

                {/* Project Info */}
                <div className="about-card">
                    <h3>📋 Project Information</h3>
                    <div className="about-row">
                        <span className="about-label">Project Name</span>
                        <span className="about-value">Dhairya Safety App</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Subject</span>
                        <span className="about-value">Mini Project (Full Stack Java)</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">University</span>
                        <span className="about-value">Mumbai University</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Year</span>
                        <span className="about-value">Second Year IT Engineering</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Version</span>
                        <span className="about-value">1.0.0</span>
                    </div>
                </div>

                {/* Team Members - FIXED! */}
                <div className="about-card">
                    <h3>👥 Team Members</h3>
                    <div className="about-row">
                        <span className="about-label">Member 1</span>
                        <span className="about-value">Aditya Tandale</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Member 2</span>
                        <span className="about-value">Rahul Sumbe</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Member 3</span>
                        <span className="about-value">Ayush Shinde</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Member 4</span>
                        <span className="about-value">Dnyaneshwar Shingate</span>
                    </div>
                </div>

                {/* Features */}
                <div className="about-card">
                    <h3>✨ Features</h3>
                    <div className="about-feature-list">
                        {features.map((f) => (
                            <div className="about-feature" key={f.title}>
                                <div className="about-feature-icon">{f.icon}</div>
                                <div className="about-feature-text">
                                    <h4>{f.title}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="about-card">
                    <h3>🛠️ Technology Stack</h3>
                    <div className="about-tech">
                        {techStack.map((t) => (
                            <span
                                key={t.label}
                                className={"about-badge about-badge-" + t.color}
                            >
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Architecture */}
                <div className="about-card">
                    <h3>🏗️ Architecture</h3>
                    <div className="about-row">
                        <span className="about-label">Frontend</span>
                        <span className="about-value">React + Vite (Vercel)</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Backend</span>
                        <span className="about-value">Spring Boot on Render</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Database</span>
                        <span className="about-value">PostgreSQL on Render</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Auth</span>
                        <span className="about-value">BCrypt password hashing</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Alerts</span>
                        <span className="about-value">EmailJS + WhatsApp + SMS</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">GPS</span>
                        <span className="about-value">Browser Geolocation API</span>
                    </div>
                </div>

                {/* Future Scope */}
                <div className="about-card">
                    <h3>🔭 Future Scope</h3>
                    <div className="about-row">
                        <span className="about-label">Police API</span>
                        <span className="about-value">Automatic police notification</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Twilio SMS</span>
                        <span className="about-value">Fully automatic SMS sending</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">JWT Auth</span>
                        <span className="about-value">Token-based authentication</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Push Alerts</span>
                        <span className="about-value">Background notifications</span>
                    </div>
                    <div className="about-row">
                        <span className="about-label">Live Tracking</span>
                        <span className="about-value">Real-time GPS via WebSockets</span>
                    </div>
                </div>

                <div className="about-footer">
                    Made with ❤️ for women's safety
                    <br />
                    Dhairya © 2026 · Mumbai University
                    <br />
                    Full Stack Java Mini Project
                </div>

            </main>
        </div>
    );
}

export default About;