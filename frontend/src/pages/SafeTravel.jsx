import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, mapLinkFor, whatsappLink, smsLink } from "../services/share";
import "./SafeTravel.css";

const TIMED_PHASES = ["traveling", "ask1", "ask2", "ask3"];

function formatTime(total) {
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return m + ":" + s;
}

function ContactList({ contacts, message }) {
    if (contacts.length === 0) {
        return (
            <p className="st-empty">
                You have no emergency contacts yet.{" "}
                <Link to="/contacts">Add contacts</Link>
            </p>
        );
    }

    return (
        <div>
            {contacts.map((c) => (
                <div className="st-contact" key={c.contactId}>
                    <div>
                        <div className="st-contact-name">{c.name}</div>
                        <div className="st-contact-phone">
                            {c.phone}
                            {c.relationship ? " · " + c.relationship : ""}
                        </div>
                    </div>
                    <div className="st-contact-buttons">
                        <a className="st-whatsapp" href={whatsappLink(c.phone, message)} target="_blank" rel="noreferrer">WhatsApp</a>
                        <a className="st-sms" href={smsLink(c.phone, message)}>SMS</a>
                        <a className="st-tel" href={"tel:" + c.phone}>Call</a>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SafeTravel() {
    const navigate = useNavigate();

    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [phase, setPhase] = useState("setup");
    const [destination, setDestination] = useState("");
    const [minutes, setMinutes] = useState(30);
    const [demo, setDemo] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [tripRecord, setTripRecord] = useState(null);
    const [warning, setWarning] = useState("");
    const [attempt, setAttempt] = useState(0);

    const travelSeconds = demo ? 15 : minutes * 60;
    const responseSeconds = demo ? 10 : 60;

    useEffect(() => {
        if (!TIMED_PHASES.includes(phase)) return;
        if (countdown <= 0) {
            handleTimeUp();
            return;
        }
        const timer = setTimeout(() => setCountdown((n) => n - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, countdown]);

    useEffect(() => {
        if ((phase === "ask1" || phase === "ask2" || phase === "ask3") && navigator.vibrate) {
            navigator.vibrate([300, 200, 300, 200, 300]);
        }
    }, [phase]);

    function goTo(nextPhase, seconds) {
        setCountdown(seconds);
        setPhase(nextPhase);
    }

    function handleTimeUp() {
        if (phase === "traveling") {
            goTo("ask1", responseSeconds);
        } else if (phase === "ask1") {
            setAttempt(1);
            goTo("ask2", responseSeconds);
        } else if (phase === "ask2") {
            setAttempt(2);
            goTo("ask3", responseSeconds);
        } else if (phase === "ask3") {
            escalate();
        }
    }

    async function startTrip() {
        if (!destination.trim()) {
            setWarning("Please enter a destination");
            return;
        }
        setPhase("working");
        setWarning("");

        const position = await getLocation();
        setLocation(position);

        try {
            const res = await apiRequest("GET", "/api/contacts");
            if (res.ok) setContacts(res.data);
        } catch {
            // ignore
        }

        try {
            const res = await apiRequest("POST", "/api/trips", {
                destination: destination.trim(),
                expectedMinutes: minutes,
                latitude: position ? position.latitude : null,
                longitude: position ? position.longitude : null,
            });
            if (res.ok) {
                setTripRecord(res.data);
            } else {
                setWarning(res.data.message || "Trip could not be saved.");
                setPhase("setup");
                return;
            }
        } catch {
            setWarning("Cannot reach the server.");
            setPhase("setup");
            return;
        }

        goTo("traveling", travelSeconds);
    }

    async function markSafe() {
        if (tripRecord) {
            try {
                await apiRequest("PUT", "/api/trips/" + tripRecord.tripId + "/safe");
            } catch {
                // ignore
            }
        }
        setPhase("safe");
    }

    async function escalate() {
        setPhase("working");

        const position = await getLocation();
        if (position) setLocation(position);

        let list = contacts;
        if (list.length === 0) {
            try {
                const res = await apiRequest("GET", "/api/contacts");
                if (res.ok) {
                    list = res.data;
                    setContacts(list);
                }
            } catch {
                // ignore
            }
        }

        if (tripRecord) {
            try {
                await apiRequest("PUT", "/api/trips/" + tripRecord.tripId + "/escalate");
            } catch {
                // ignore
            }
        }

        setPhase("alert");
    }

    if (!user) return <Navigate to="/login" replace />;

    const mapLink = mapLinkFor(location);
    const where = mapLink ? "Last known location: " + mapLink : "Location is not available.";
    const message =
        "TRAVEL ALERT: " + user.name + " was travelling to " + (tripRecord?.destination || destination) +
        " and has not confirmed reaching safely. " + where + " Please call them now.";

    if (phase === "setup") {
        return (
            <div className="st-page">
                <div className="st-card">
                    <Link to="/" className="st-back">← Back</Link>
                    <h1>Safe Travel Mode</h1>
                    <p className="st-text">
                        Tell us where you're going. If you don't confirm reaching safely,
                        we'll alert your trusted contacts.
                    </p>

                    <label className="st-label">Destination</label>
                    <input
                        className="st-input"
                        type="text"
                        placeholder="e.g. Andheri Station"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />

                    <label className="st-label">Expected travel time (minutes)</label>
                    <input
                        className="st-input"
                        type="number"
                        min="1"
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value) || 0)}
                    />

                    {warning && <div className="st-warn">{warning}</div>}

                    <label className="st-demo">
                        <input
                            type="checkbox"
                            checked={demo}
                            onChange={(e) => setDemo(e.target.checked)}
                        />
                        Demo mode (short timers for presentation)
                    </label>

                    <button className="st-start" onClick={startTrip}>Start Journey</button>
                </div>
            </div>
        );
    }

    if (phase === "working") {
        return (
            <div className="st-page">
                <div className="st-card">
                    <h1>Please wait...</h1>
                    <p className="st-text">Saving your trip and location.</p>
                </div>
            </div>
        );
    }

    if (phase === "traveling") {
        return (
            <div className="st-page">
                <div className="st-card">
                    <h1>Travelling to {tripRecord?.destination}</h1>
                    <p className="st-text">We'll check on you in</p>
                    <div className="st-timer">{formatTime(countdown)}</div>

                    {warning && <div className="st-warn">{warning}</div>}
                    <div className="st-ok">
                        {location ? "✓ Journey started with your location" : "Location unavailable"}
                    </div>

                    <a className="st-call" href="tel:112">📞 Call 112 (Emergency)</a>
                    <button className="st-safe" onClick={markSafe}>I've reached safely</button>
                </div>
            </div>
        );
    }

    if (phase === "ask1" || phase === "ask2" || phase === "ask3") {
        const isLast = phase === "ask3";
        return (
            <div className="st-page">
                <div className="st-card">
                    <h1>Have you reached safely?</h1>
                    <p className="st-text">
                        {isLast
                            ? "This is the last reminder. If you don't respond, your contacts will be alerted in"
                            : "Attempt " + (attempt + 1) + " of 3. We'll ask again in"}
                    </p>
                    <div className="st-timer st-timer-red">{formatTime(countdown)}</div>

                    <div className="st-answers">
                        <button className="st-yes" onClick={markSafe}>Yes</button>
                        <button className="st-no" onClick={() => {
                            if (isLast) escalate();
                            else {
                                setAttempt(attempt + 1);
                                goTo("ask" + (attempt + 2), responseSeconds);
                            }
                        }}>No</button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "alert") {
        return (
            <div className="st-page st-page-alert">
                <div className="st-card">
                    <h1>🚨 Travel alert</h1>
                    <p className="st-text">
                        {user.name} has not confirmed reaching {tripRecord?.destination}. Alert your contacts now.
                    </p>

                    <a className="st-call" href="tel:112">📞 Call 112 (Emergency)</a>

                    <h2>Your contacts</h2>
                    <ContactList contacts={contacts} message={message} />

                    <button className="st-safe" onClick={markSafe}>I'm safe now</button>

                    <p className="st-note">
                        Automatic police notification is future scope. It needs official
                        emergency-service integration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="st-page">
            <div className="st-card">
                <h1>✅ Journey complete</h1>
                <p className="st-text">Glad you reached safely.</p>
                <button className="st-safe" onClick={() => navigate("/")}>Back to Home</button>
            </div>
        </div>
    );
}

export default SafeTravel;