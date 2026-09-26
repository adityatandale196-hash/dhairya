import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, mapLinkFor, whatsappLink, smsLink } from "../services/share";
import "./Sos.css";

function Sos() {
    const navigate = useNavigate();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [contacts, setContacts] = useState([]);
    const [location, setLocation] = useState(null);
    const [alertRecord, setAlertRecord] = useState(null);
    const [status, setStatus] = useState("working");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        startSos();
    }, []);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    async function startSos() {
        setStatus("working");
        setError("");

        const pos = await getLocation();
        setLocation(pos);

        // Create SOS alert
        try {
            const res = await apiRequest("POST", "/api/alerts/sos", {
                latitude: pos ? pos.latitude : null,
                longitude: pos ? pos.longitude : null,
            });
            if (res.ok) {
                setAlertRecord(res.data);

                // 🔥 AUTOMATIC ESCALATION — send SMS + email to all contacts
                // Fire-and-forget: don't await, because the backend takes ~40s
                // (10s delay between each contact's SMS). The UI moves on immediately.
                apiRequest(
                    "PUT",
                    "/api/alerts/" + res.data.alertId + "/escalate"
                ).catch(() => {
                    // ignore — alerts still queued on backend
                });
            } else {
                setError(res.data.message || "Could not save alert");
            }
        } catch {
            setError("Cannot reach the server");
        }

        // Load contacts (for the manual buttons below)
        try {
            const res = await apiRequest("GET", "/api/contacts");
            if (res.ok) setContacts(res.data);
        } catch {
            // ignore
        }

        const mapLink = mapLinkFor(pos);
        const where = mapLink ? "My location: " + mapLink : "Location unavailable.";
        const text =
            "SOS EMERGENCY from Dhairya. " +
            user.name +
            " needs help immediately. " +
            where +
            " Please call me now.";
        setMessage(text);

        setStatus("ready");
    }

    async function markSafe() {
        if (alertRecord) {
            try {
                await apiRequest(
                    "PUT",
                    "/api/alerts/" + alertRecord.alertId + "/resolve"
                );
            } catch {
                // ignore
            }
        }
        navigate("/");
    }

    function openShareMenu() {
        if (navigator.share) {
            navigator
                .share({
                    title: "SOS Alert from Dhairya",
                    text: message,
                })
                .catch(() => {});
        } else {
            if (contacts.length > 0) {
                window.open(whatsappLink(contacts[0].phone, message), "_blank");
            }
        }
    }

    function smsAll() {
        if (contacts.length === 0) return;
        const numbers = contacts.map((c) => c.phone).join(",");
        window.location.href = "sms:" + numbers + "?body=" + encodeURIComponent(message);
    }

    const mapLink = mapLinkFor(location);

    return (
        <div className="sos-page">
            <div className="sos-card">
                <Link to="/" className="sos-back">← Back</Link>

                <h1 className="sos-title">🚨 SOS Activated</h1>

                {status === "working" && (
                    <p className="sos-status">Getting your location and saving alert...</p>
                )}

                {alertRecord && (
                    <div className="sos-badge sos-badge-ok">
                        ✓ Alert sent to all trusted contacts
                    </div>
                )}

                {location && (
                    <div className="sos-badge sos-badge-ok">
                        ✓ Location found ·{" "}
                        <a href={mapLink} target="_blank" rel="noreferrer" className="sos-map-link">
                            Open map
                        </a>
                    </div>
                )}

                {!location && status === "ready" && (
                    <div className="sos-badge sos-badge-warn">Location unavailable</div>
                )}

                {error && <div className="sos-badge sos-badge-warn">{error}</div>}

                <a href="tel:112" className="sos-call-112">
                    📞 Call 112 — Emergency
                </a>

                <h2 className="sos-section-title">Need more help? Reach out directly</h2>

                <button className="sos-alert-all" onClick={openShareMenu}>
                    🚨 Share via WhatsApp
                </button>

                <button className="sos-sms-all" onClick={smsAll}>
                    📱 SMS All (Auto-fill)
                </button>

                <p className="sos-note">
                    Your contacts were already alerted automatically. Use the buttons
                    below if you want to reach them personally too.
                </p>

                {contacts.length === 0 && (
                    <p className="sos-empty">
                        You have no emergency contacts yet.{" "}
                        <Link to="/contacts">Add contacts</Link>
                    </p>
                )}

                {contacts.map((contact) => (
                    <div className="sos-contact-card" key={contact.contactId}>
                        <div className="sos-contact-name">{contact.name}</div>
                        <div className="sos-contact-meta">
                            {contact.phone}
                            {contact.relationship ? " · " + contact.relationship : ""}
                        </div>
                        <div className="sos-contact-actions">
                            <a
                                className="sos-action-whatsapp"
                                href={whatsappLink(contact.phone, message)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                            <a className="sos-action-sms" href={smsLink(contact.phone, message)}>
                                SMS
                            </a>
                            <a className="sos-action-call" href={"tel:" + contact.phone}>
                                Call
                            </a>
                        </div>
                    </div>
                ))}

                <button className="sos-safe" onClick={markSafe}>
                    I'm safe now
                </button>
            </div>
        </div>
    );
}

export default Sos;