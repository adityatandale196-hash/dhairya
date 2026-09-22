import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, whatsappLink, smsLink, mapLinkFor } from "../services/share";
import "./LiveLocation.css";

function LiveLocation() {
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [contacts, setContacts] = useState([]);
    const [location, setLocation] = useState(null);
    const [warn, setWarn] = useState("");

    useEffect(() => {
        async function load() {
            if (!user) return;
            const res = await apiRequest("GET", "/api/contacts?userId=" + user.userId);
            if (res.ok) setContacts(res.data);
        }
        load();
    }, []);

    async function handleGetLocation() {
        setWarn("");
        const loc = await getLocation();
        if (!loc) {
            setWarn("Location unavailable. Allow location access in browser settings, then try again.");
            return;
        }
        setLocation(loc);
    }

    if (!user) return <Navigate to="/login" replace />;

    const mapLink = mapLinkFor(location);
    const msg = "My current location: " + (mapLink || "Location not available.");

    return (
        <div className="ll-page">
            <div className="ll-card">
                <div className="ll-header">
                    <Link to="/" className="ll-back">← Back</Link>
                    <h1 className="ll-title">📍 Share Location</h1>
                </div>

                <p>Get your current GPS location and share it with your trusted contacts instantly via WhatsApp or SMS.</p>

                {warn && <div className="ll-warn">{warn}</div>}

                <button className="ll-refresh" onClick={handleGetLocation}>
                    Get My Location
                </button>

                {location && (
                    <div style={{ marginTop: "20px" }}>
                        <p style={{ color: "#16a34a", fontWeight: "bold" }}>✓ Location found</p>
                        <a href={mapLink} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>Open in Google Maps</a>
                    </div>
                )}

                <h3 style={{ marginTop: "30px", marginBottom: "10px" }}>Share with your contacts</h3>
                {contacts.map((c) => (
                    <div className="ll-contact" key={c.contactId}>
                        <div className="ll-contact-name">{c.name}</div>
                        <div className="ll-contact-info">{c.phone} · {c.relationship}</div>
                        <div className="ll-actions">
                            <a className="ll-btn ll-whatsapp" href={whatsappLink(c.phone, msg)} target="_blank" rel="noreferrer">WhatsApp</a>
                            <a className="ll-btn ll-sms" href={smsLink(c.phone, msg)}>SMS</a>
                            <a className="ll-btn ll-call" href={"tel:" + c.phone}>Call</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LiveLocation;