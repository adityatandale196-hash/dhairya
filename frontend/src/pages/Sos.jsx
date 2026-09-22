import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, mapLinkFor } from "../services/share";
import AlertPanel from "../components/AlertPanel";
import "./Sos.css";

const COUNTDOWN_SECONDS = 5;

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
        if (!user || phase !== "countdown") return;
        if (seconds === 0) { sendSos(); return; }
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, seconds]);

    async function sendSos() {
        if (startedRef.current) return;
        startedRef.current = true;
        setPhase("sending");

        const position = await getLocation();
        setLocation(position);

        let list = [];
        try {
            const res = await apiRequest("GET", "/api/contacts?userId=" + user.userId);
            if (res.ok) list = res.data;
        } catch {}

        let saved = null;
        try {
            const res = await apiRequest("POST", "/api/alerts/sos", {
                userId: user.userId,
                latitude: position ? position.latitude : null,
                longitude: position ? position.longitude : null,
            });
            if (res.ok) saved = res.data;
            else setError(res.data.message || "Alert could not be saved.");
        } catch { setError("Cannot reach the server."); }

        setContacts(list);
        setAlertRecord(saved);
        setPhase("sent");
    }

    async function handleSafe() {
        if (alertRecord) {
            try {
                await apiRequest("PUT", "/api/alerts/" + alertRecord.alertId + "/resolve?userId=" + user.userId);
            } catch {}
        }
        navigate("/");
    }

    if (!user) return <Navigate to="/login" replace />;

    const mapLink = mapLinkFor(location);
    const message = location
        ? "EMERGENCY! " + user.name + " needs help. Current location: " + mapLink
        : "EMERGENCY! " + user.name + " needs help. Location unavailable. Please call immediately.";

    if (phase === "countdown") return (
        <div className="sos-page">
            <div className="sos-box">
                <h1>Sending SOS in</h1>
                <div className="sos-count">{seconds}</div>
                <p className="sos-text">Your location will be shared with your emergency contacts.</p>
                <button className="sos-cancel" onClick={() => navigate("/")}>Cancel</button>
            </div>
        </div>
    );

    if (phase === "sending") return (
        <div className="sos-page">
            <div className="sos-box">
                <h1>Getting your location...</h1>
                <p className="sos-text">Please allow location access if asked.</p>
            </div>
        </div>
    );

    return (
        <div className="sos-page">
            <div className="sos-box">
                <h1>🚨 SOS Activated</h1>

                <div className="sos-status">
                    {alertRecord
                        ? <p className="sos-ok">✓ Alert saved</p>
                        : <p className="sos-warn">{error || "Alert could not be saved."}</p>
                    }
                    {location
                        ? <p className="sos-ok">✓ Location found · <a href={mapLink} target="_blank" rel="noreferrer">Open map</a></p>
                        : <p className="sos-warn">Location unavailable.</p>
                    }
                </div>

                <a className="sos-call" href="tel:112">📞 Call 112 (Emergency)</a>

                <h2>Alert your contacts</h2>
                <AlertPanel contacts={contacts} message={message} />

                <button className="sos-safe" onClick={handleSafe}>I'm safe now</button>
            </div>
        </div>
    );
}

export default Sos;