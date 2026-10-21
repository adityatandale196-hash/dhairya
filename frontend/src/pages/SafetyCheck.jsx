import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getLocation, mapLinkFor, whatsappLink, smsLink } from "../services/share";
import { createSiren } from "../services/sound"; // ADDED
import "./SafetyCheck.css";

const TIMED_PHASES = ["wait1", "ask2", "alert1", "ask3"];

function formatTime(total) {
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return m + ":" + s;
}

function ContactList({ contacts, message }) {
    if (contacts.length === 0) {
        return (
            <p className="sc-empty">
                You have no emergency contacts yet. <Link to="/contacts">Add contacts</Link>
            </p>
        );
    }
    return (
        <div>
            {contacts.map((c) => (
                <div className="sc-contact" key={c.contactId}>
                    <div>
                        <div className="sc-contact-name">{c.name}</div>
                        <div className="sc-contact-phone">
                            {c.phone} {c.relationship ? " · " + c.relationship : ""}
                        </div>
                    </div>
                    <div className="sc-contact-buttons">
                        <a className="sc-whatsapp" href={whatsappLink(c.phone, message)} target="_blank" rel="noreferrer">WhatsApp</a>
                        <a className="sc-sms" href={smsLink(c.phone, message)}>SMS</a>
                        <a className="sc-tel" href={"tel:" + c.phone}>Call</a>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SafetyCheck() {
    const navigate = useNavigate();
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [phase, setPhase] = useState("ask1");
    const [demo, setDemo] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [location, setLocation] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [alertRecord, setAlertRecord] = useState(null);
    const [warning, setWarning] = useState("");

    // ADDED: Initialize Siren
    const [siren] = useState(() => createSiren());

    // ADDED: Cleanup siren on unmount
    useEffect(() => {
        return () => siren.stop();
    }, [siren]);

    const intervalSeconds = demo ? 15 : 180;
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
        if ((phase === "ask2" || phase === "ask3") && navigator.vibrate) {
            navigator.vibrate([300, 200, 300, 200, 300]);
        }
    }, [phase]);

    useEffect(() => {
        let lock = null;
        let cancelled = false;
        async function keepAwake() {
            try {
                if (navigator.wakeLock) {
                    const result = await navigator.wakeLock.request("screen");
                    if (cancelled) result.release();
                    else lock = result;
                }
            } catch {}
        }
        keepAwake();
        return () => {
            cancelled = true;
            if (lock) lock.release();
        };
    }, []);

    function goTo(nextPhase, seconds) {
        setCountdown(seconds);
        setPhase(nextPhase);
    }

    function handleTimeUp() {
        if (phase === "wait1") {
            goTo("ask2", responseSeconds);
        } else if (phase === "ask2") {
            escalate(1);
        } else if (phase === "alert1") {
            goTo("ask3", responseSeconds);
        } else if (phase === "ask3") {
            escalate(2);
        }
    }

    async function startCheck() {
        setPhase("working");
        setWarning("");
        const position = await getLocation();
        setLocation(position);

        try {
            const res = await apiRequest("GET", "/api/contacts");
            if (res.ok) setContacts(res.data);
        } catch {}

        try {
            const res = await apiRequest("POST", "/api/alerts/safety-check", {
                latitude: position ? position.latitude : null,
                longitude: position ? position.longitude : null,
            });
            if (res.ok) setAlertRecord(res.data);
            else setWarning(res.data.message || "The check could not be saved.");
        } catch {
            setWarning("Cannot reach the server.");
        }
        goTo("wait1", intervalSeconds);
    }

    async function escalate(level) {
        setPhase("working");

        // ADDED: Trigger Siren on level 2 (Final Urgent alert)
        if (level === 2) {
            siren.start();
        }

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
            } catch {}
        }

        if (alertRecord) {
            try {
                await apiRequest("PUT", "/api/alerts/" + alertRecord.alertId + "/escalate");
            } catch {}
        }

        if (level === 1) goTo("alert1", intervalSeconds);
        else setPhase("alert2");
    }

    async function markSafe() {
        // ADDED: Stop siren
        siren.stop();

        if (alertRecord) {
            try {
                await apiRequest("PUT", "/api/alerts/" + alertRecord.alertId + "/resolve");
            } catch {}
        }
        setPhase("safe");
    }

    if (!user) return <Navigate to="/login" replace />;

    const mapLink = mapLinkFor(location);
    const where = mapLink ? "Current location: " + mapLink : "Location is not available.";
    const message1 = "SAFETY ALERT: " + user.name + " feels unsafe and may need help. " + where + " Please call them now.";
    const message2 = "URGENT: " + user.name + " has not confirmed being safe after repeated safety checks. " + where + " Please call them immediately or contact the police (112).";

    // ... (REST OF THE RENDER BLOCKS REMAIN EXACTLY THE SAME AS BEFORE) ...
    // Replace the return statement with your exact previous return logic.

    if (phase === "ask1") {
        return (
            <div className="sc-page">
                <div className="sc-card">
                    <Link to="/" className="sc-back">← Back</Link>
                    <h1>Are you feeling unsafe?</h1>
                    <p className="sc-text">If you say yes, Dhairya will check on you again and alert your trusted contacts.</p>
                    <div className="sc-answers">
                        <button className="sc-yes" onClick={startCheck}>Yes</button>
                        <button className="sc-no" onClick={() => navigate("/")}>No</button>
                    </div>
                    <label className="sc-demo">
                        <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
                        Demo mode (short timers)
                    </label>
                </div>
            </div>
        );
    }

    if (phase === "working") {
        return (
            <div className="sc-page">
                <div className="sc-card">
                    <h1>Please wait...</h1>
                    <p className="sc-text">Getting your location.</p>
                </div>
            </div>
        );
    }

    if (phase === "wait1") {
        return (
            <div className="sc-page">
                <div className="sc-card">
                    <h1>Safety check started</h1>
                    <p className="sc-text">We will check on you again in</p>
                    <div className="sc-timer">{formatTime(countdown)}</div>
                    {warning && <div className="sc-warn">{warning}</div>}
                    <div className="sc-ok">{location ? "✓ Your location was saved" : "Location unavailable"}</div>
                    <a className="sc-call" href="tel:112">📞 Call 112</a>
                    <button className="sc-safe" onClick={markSafe}>I'm safe now</button>
                </div>
            </div>
        );
    }

    if (phase === "ask2") {
        return (
            <div className="sc-page">
                <div className="sc-card">
                    <h1>Are you still feeling unsafe?</h1>
                    <p className="sc-text">If you do not respond, your contacts will be alerted in</p>
                    <div className="sc-timer sc-timer-red">{formatTime(countdown)}</div>
                    <div className="sc-answers">
                        <button className="sc-yes" onClick={() => escalate(1)}>Yes</button>
                        <button className="sc-no" onClick={markSafe}>No</button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "alert1") {
        return (
            <div className="sc-page sc-page-alert">
                <div className="sc-card">
                    <h1>🚨 Alert your trusted contacts</h1>
                    <p className="sc-text">Send your location. We will check on you again in {formatTime(countdown)}.</p>
                    <h2>Your contacts</h2>
                    <ContactList contacts={contacts} message={message1} />
                    <a className="sc-call" href="tel:112">📞 Call 112</a>
                    <button className="sc-safe" onClick={markSafe}>I'm safe now</button>
                </div>
            </div>
        );
    }

    if (phase === "ask3") {
        return (
            <div className="sc-page">
                <div className="sc-card">
                    <h1>Are you safe now?</h1>
                    <p className="sc-text">If you do not respond, an urgent alert will be raised in</p>
                    <div className="sc-timer sc-timer-red">{formatTime(countdown)}</div>
                    <div className="sc-answers">
                        <button className="sc-no" onClick={markSafe}>Yes, I'm safe</button>
                        <button className="sc-yes" onClick={() => escalate(2)}>No, I need help</button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "alert2") {
        return (
            <div className="sc-page sc-page-alert">
                <div className="sc-card">
                    <h1>🚨 Urgent alert</h1>
                    <p className="sc-text">No confirmation. Alert contacts and call emergency now.</p>
                    <a className="sc-call" href="tel:112">📞 Call 112</a>
                    <h2>Your contacts</h2>
                    <ContactList contacts={contacts} message={message2} />
                    <button className="sc-safe" onClick={markSafe}>I'm safe now</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sc-page">
            <div className="sc-card">
                <h1>✅ Glad you're safe</h1>
                <p className="sc-text">The safety check has ended.</p>
                <button className="sc-safe" onClick={() => navigate("/")}>Back to Home</button>
            </div>
        </div>
    );
}

export default SafetyCheck;