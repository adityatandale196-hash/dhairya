import { Navigate, useNavigate } from "react-router-dom";
import "../App.css";
import dhairyaLogo from "../assets/logo.png";
import ThemeToggle from "../components/ThemeToggle"; // Import the new component

const features = [
    { icon: "🛡️", title: "Safety Check", text: "Check your safety", path: "/safety-check" },
    { icon: "🚗", title: "Safe Travel", text: "Track your journey", path: "/safe-travel" },
    { icon: "📍", title: "Live Location", text: "Share your location", path:"/live-location"},
    { icon: "👥", title: "Trusted Circle", text: "Your trusted people", path: "/contacts" },
    { icon: "📞", title: "Fake Call", text: "Get a simulated call", path: "/fake-call" },
    { icon: "🔊", title: "Emergency Siren", text: "Activate siren", path: "/siren" },
];

function Home() {
    const navigate = useNavigate();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    function handleLogout() {
        localStorage.removeItem("dhairyaUser");
        navigate("/login");
    }

    return (
        <div className="app">
            <header className="top-bar">
                <div className="brand">
                    <img src={dhairyaLogo} alt="Dhairya Logo" className="brand-logo" />
                    <div>
                        <h1>Dhairya</h1>
                        <p>Hi, {user.name}</p>
                    </div>
                </div>

                {/* Toggle and Logout buttons */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <ThemeToggle />
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <main className="home-container">
                <section className="welcome-card">
                    <img src={dhairyaLogo} alt="Dhairya Logo" className="welcome-logo" />
                    <p className="small-text">Welcome to Dhairya</p>
                    <h2>Stay Safe.<br />Stay Connected.</h2>
                    <p className="welcome-description">Smart safety support for emergencies and travel.</p>
                </section>

                <section className="sos-section">
                    <button className="sos-button" onClick={() => navigate("/sos")}>
                        <span className="sos-icon">!</span>
                        <span>SOS</span>
                        <small>Emergency</small>
                    </button>
                </section>

                <section className="feature-grid">
                    {features.map((f) => (
                        <button className="feature-card" key={f.title} onClick={() => f.path && navigate(f.path)}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </button>
                    ))}
                </section>
            </main>

            <nav className="bottom-nav">
                <button onClick={() => navigate("/")}><span>⌂</span><small>Home</small></button>
                <button onClick={() => navigate("/live-location")}><span>📍</span><small>Location</small></button>
                <button className="nav-sos" onClick={() => navigate("/sos")}><span>!</span></button>
                <button onClick={() => navigate("/contacts")}><span>👥</span><small>Contacts</small></button>
                <button onClick={() => navigate("/about")}><span>⚙️</span><small>About</small></button>
            </nav>
        </div>
    );
}

export default Home;