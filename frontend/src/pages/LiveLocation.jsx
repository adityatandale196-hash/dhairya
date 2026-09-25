import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getLocation, mapLinkFor, whatsappLink, smsLink } from "../services/share";
import { apiRequest } from "../services/api";
import "./LiveLocation.css";

function LiveLocation() {
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [contacts, setContacts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        async function load() {
            const pos = await getLocation();
            if (cancelled) return;
            if (pos) {
                setLocation(pos);
                setLastUpdate(new Date());
            } else {
                setError("Could not get your location. Allow location access in your browser.");
            }
            setLoading(false);

            try {
                const res = await apiRequest("GET", "/api/contacts");
                if (res.ok) setContacts(res.data);
            } catch {
                // ignore
            }
        }

        load();

        // Refresh every 30 seconds while page is open
        const interval = setInterval(load, 30_000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    if (!user) return <Navigate to="/login" replace />;

    const mapLink = mapLinkFor(location);
    const message = location
        ? "Live location from " + user.name + ": " + mapLink + " (shared via Dhairya)"
        : "Live location from " + user.name + " (location unavailable)";

    function copyLink() {
        if (!mapLink) return;
        navigator.clipboard.writeText(mapLink).then(
            () => alert("Location link copied"),
            () => alert("Could not copy")
        );
    }

    return (
        <div className="ll-page">
            <div className="ll-card">
                <Link to="/" className="ll-back">← Back</Link>

                <h1 className="ll-title">📍 Live Location</h1>
                <p className="ll-text">
                    Share your current location with your trusted circle. This page
                    refreshes automatically every 30 seconds while open.
                </p>

                {loading && <p className="ll-status">Getting your location...</p>}

                {error && <div className="ll-warn">{error}</div>}

                {location && (
                    <>
                        <div className="ll-coords">
                            <div className="ll-coord-row">
                                <span className="ll-coord-label">Latitude</span>
                                <span className="ll-coord-value">{location.latitude.toFixed(6)}</span>
                            </div>
                            <div className="ll-coord-row">
                                <span className="ll-coord-label">Longitude</span>
                                <span className="ll-coord-value">{location.longitude.toFixed(6)}</span>
                            </div>
                            {lastUpdate && (
                                <div className="ll-coord-row">
                                    <span className="ll-coord-label">Updated</span>
                                    <span className="ll-coord-value">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                                </div>
                            )}
                        </div>

                        <a
                            className="ll-map-btn"
                            href={mapLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            🗺️ Open in Google Maps
                        </a>

                        <button className="ll-copy-btn" onClick={copyLink}>
                            📋 Copy location link
                        </button>
                    </>
                )}

                <h2 className="ll-section-title">Share with your trusted circle</h2>

                {contacts.length === 0 && (
                    <p className="ll-empty">
                        You have no contacts yet. <Link to="/contacts">Add contacts</Link>
                    </p>
                )}

                {contacts.map((c) => (
                    <div className="ll-contact" key={c.contactId}>
                        <div className="ll-contact-name">{c.name}</div>
                        <div className="ll-contact-actions">
                            <a
                                className="ll-action-whatsapp"
                                href={whatsappLink(c.phone, message)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                            <a className="ll-action-sms" href={smsLink(c.phone, message)}>
                                SMS
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LiveLocation;