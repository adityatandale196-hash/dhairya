import { Navigate, useNavigate } from "react-router-dom";
import "../App.css";
import dhairyaLogo from "../assets/logo.png";

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

            {/* Header */}
            <header className="top-bar">
                <div className="brand">
                    <img src={dhairyaLogo} alt="Dhairya Logo" className="brand-logo" />
                    <div>
                        <h1>Dhairya</h1>
                        <p>Hi, {user.name}</p>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
                    <button className="sos-button">
                        <span className="sos-icon">!</span>
                        <span>SOS</span>
                        <small>Emergency</small>
                    </button>
                </section>

                {/* Features */}
                <section className="feature-grid">
                    <button className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Safety Check</h3>
                        <p>Check your safety</p>
                    </button>

                    <button className="feature-card">
                        <div className="feature-icon">🚗</div>
                        <h3>Safe Travel</h3>
                        <p>Track your journey</p>
                    </button>

                    <button className="feature-card">
                        <div className="feature-icon">📍</div>
                        <h3>Live Location</h3>
                        <p>Share your location</p>
                    </button>

                    <button className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Trusted Circle</h3>
                        <p>Your trusted people</p>
                    </button>

                    <button className="feature-card">
                        <div className="feature-icon">📞</div>
                        <h3>Fake Call</h3>
                        <p>Get a simulated call</p>
                    </button>

                    <button className="feature-card">
                        <div className="feature-icon">🔊</div>
                        <h3>Emergency Siren</h3>
                        <p>Activate siren</p>
                    </button>
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button>
                    <span>⌂</span>
                    <small>Home</small>
                </button>
                <button>
                    <span>📍</span>
                    <small>Location</small>
                </button>
                <button className="nav-sos">
                    <span>!</span>
                </button>
                <button>
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