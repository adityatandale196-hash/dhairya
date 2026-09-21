import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, mapLinkFor, whatsappLink, smsLink } from "../services/share";
import "./LiveLocation.css";

function LiveLocation() {
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleGetLocation() {
        setLoading(true);

        const position = await getLocation();
        setLocation(position);

        try {
            const res = await apiRequest("GET", "/api/contacts?userId=" + user.userId);
            if (res.ok) {
                setContacts(res.data);
            }
        } catch {
            // contacts stay empty
        }

        setLoading(false);
        setDone(true);
    }

    function handleRefresh() {
        setDone(false);
        setLocation(null);
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const mapLink = mapLinkFor(location);

    const message = location
        ? user.name + " is sharing their current location with you: " + mapLink
        : user.name + " wants to share their location but GPS is unavailable. Please call them.";

    return (
        <div className="ll-page">
            <div className="ll-card">

                <Link to="/" className="ll-back">← Back</Link>
                <h1>📍 Share Location</h1>
                <p className="ll-text">
                    Get your current GPS location and share it with your trusted contacts
                    instantly via WhatsApp or SMS.
                </p>

                {!done && (
                    <button className="ll-get" onClick={handleGetLocation} disabled={loading}>
                        {loading ? "Getting location..." : "Get My Location"}
                    </button>
                )}

                {done && (
                    <div className="ll-status">
                        {location ? (
                            <div className="ll-ok">✓ Location found</div>
                        ) : (
                            <div className="ll-warn">
                                Location unavailable. Allow location access in browser settings,
                                then try again.
                            </div>
                        )}
                    </div>
                )}

                {done && location && (
                    <a className="ll-map-link" href={mapLink} target="_blank" rel="noreferrer">
                        🗺️ Open my location on Google Maps
                    </a>
                )}

                {done && (
                    <div>
                        <h2>Share with your contacts</h2>

                        {contacts.length === 0 && (
                            <p className="ll-empty">
                                You have no contacts yet. <Link to="/contacts">Add contacts</Link>
                            </p>
                        )}

                        {contacts.map((c) => (
                            <div className="ll-contact" key={c.contactId}>
                                <div className="ll-contact-name">{c.name}</div>
                                <div className="ll-contact-phone">
                                    {c.phone}
                                    {c.relationship ? " · " + c.relationship : ""}
                                </div>
                                <div className="ll-contact-buttons">
                                    <a className="ll-whatsapp" href={whatsappLink(c.phone, message)} target="_blank" rel="noreferrer">WhatsApp</a>
                                    <a className="ll-sms" href={smsLink(c.phone, message)}>SMS</a>
                                    <a className="ll-tel" href={"tel:" + c.phone}>Call</a>
                                </div>
                            </div>
                        ))}

                        <button className="ll-get" onClick={handleRefresh} style={{ marginTop: "16px" }}>
                            Refresh Location
                        </button>
                    </div>
                )}

                <div className="ll-note">
                    <strong>Note:</strong> This shares your location at this moment.
                    Continuous live tracking is planned as future scope and needs a
                    real-time server connection.
                </div>

            </div>
        </div>
    );
}

export default LiveLocation;