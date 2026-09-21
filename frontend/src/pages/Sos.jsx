import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Sos.css";

const COUNTDOWN_SECONDS = 5;

function getLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

// WhatsApp needs the country code. A 10-digit Indian number gets 91 added.
function toWhatsAppNumber(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? "91" + digits : digits;
}

function whatsappLink(phone, text) {
    return "https://wa.me/" + toWhatsAppNumber(phone) + "?text=" + encodeURIComponent(text);
}

function smsLink(phone, text) {
    return "sms:" + phone + "?body=" + encodeURIComponent(text);
}

function Sos() {
    const navigate = useNavigate();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [phase, setPhase] = useState("countdown");
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [alertRecord, setAlertRecord] = useState(null);
    const [error, setError] = useState("");
    const startedRef = useRef(false);

    useEffect(() => {
        if (!user || phase !== "countdown") {
            return;
        }
        if (seconds === 0) {
            sendSos();
            return;
        }
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, seconds]);

    async function sendSos() {
        if (startedRef.current) {
            return;
        }
        startedRef.current = true;
        setPhase("sending");

        const position = await getLocation();
        setLocation(position);

        let list = [];
        try {
            const res = await apiRequest("GET", "/api/contacts?userId=" + user.userId);
            if (res.ok) {
                list = res.data;
            }
        } catch {
            // contacts stay empty
        }

        let saved = null;
        try {
            const res = await apiRequest("POST", "/api/alerts/sos", {
                userId: user.userId,
                latitude: position ? position.latitude : null,
                longitude: position ? position.longitude : null,
            });
            if (res.ok) {
                saved = res.data;
            } else {
                setError(res.data.message || "The alert could not be saved.");
            }
        } catch {
            setError("Cannot reach the server.");
        }

        setContacts(list);
        setAlertRecord(saved);
        setPhase("sent");
    }

    async function handleSafe() {
        if (alertRecord) {
            try {
                await apiRequest(
                    "PUT",
                    "/api/alerts/" + alertRecord.alertId + "/resolve?userId=" + user.userId
                );
            } catch {
                // going home anyway
            }
        }
        navigate("/");
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const mapLink = location
        ? "https://www.google.com/maps?q=" + location.latitude + "," + location.longitude
        : null;

    const message = location
        ? "EMERGENCY! " + user.name + " needs help. My current location: " + mapLink
        : "EMERGENCY! " + user.name + " needs help. My location is not available, please call me immediately.";

    return (
        <div className="sos-page">
            <div className="sos-box">

                {phase === "countdown" && (
                    <div>
                        <h1>Sending SOS in</h1>
                        <div className="sos-count">{seconds}</div>
                        <p className="sos-text">
                            Your location will be prepared for your emergency contacts.
                            Tap cancel if this was a mistake.
                        </p>
                        <button className="sos-cancel" onClick={() => navigate("/")}>
                            Cancel
                        </button>
                    </div>
                )}

                {phase === "sending" && (
                    <div>
                        <h1>Getting your location...</h1>
                        <p className="sos-text">Please allow location access if asked.</p>
                    </div>
                )}

                {phase === "sent" && (
                    <div>
                        <h1>🚨 SOS Activated</h1>

                        <div className="sos-status">
                            {alertRecord ? (
                                <p className="sos-ok">✓ Alert saved</p>
                            ) : (
                                <p className="sos-warn">
                                    {error || "The alert could not be saved."} You can still
                                    message your contacts below.
                                </p>
                            )}

                            {location ? (
                                <p className="sos-ok">
                                    ✓ Location found ·{" "}
                                    <a href={mapLink} target="_blank" rel="noreferrer">
                                        Open map
                                    </a>
                                </p>
                            ) : (
                                <p className="sos-warn">
                                    Location unavailable. Allow location access in your browser
                                    settings. The message below will ask them to call you.
                                </p>
                            )}
                        </div>

                        <a className="sos-call" href="tel:112">
                            📞 Call 112 (Emergency)
                        </a>

                        <h2>Alert your contacts</h2>

                        {contacts.length === 0 && (
                            <p className="sos-empty">
                                You have no emergency contacts yet.{" "}
                                <Link to="/contacts">Add contacts</Link>
                            </p>
                        )}

                        {contacts.map((c) => (
                            <div className="sos-contact" key={c.contactId}>
                                <div>
                                    <div className="sos-contact-name">{c.name}</div>
                                    <div className="sos-contact-phone">
                                        {c.phone}
                                        {c.relationship ? " · " + c.relationship : ""}
                                    </div>
                                </div>

                                <div className="sos-contact-buttons">
                                    <a className="sos-whatsapp" href={whatsappLink(c.phone, message)} target="_blank" rel="noreferrer">WhatsApp</a>
                                    <a className="sos-sms" href={smsLink(c.phone, message)}>SMS</a>
                                    <a className="sos-tel" href={"tel:" + c.phone}>Call</a>
                                </div>
                            </div>
                        ))}

                        <button className="sos-safe" onClick={handleSafe}>
                            I'm safe now
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Sos;