import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createRingtone } from "../services/sound";
import "./FakeCall.css";

function formatTime(total) {
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return m + ":" + s;
}

function FakeCall() {
    const navigate = useNavigate();
    const [ringtone] = useState(() => createRingtone());

    const [phase, setPhase] = useState("setup");
    const [callerName, setCallerName] = useState("Mom");
    const [delay, setDelay] = useState(10);
    const [waitLeft, setWaitLeft] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    // Countdown before the call arrives
    useEffect(() => {
        if (phase !== "waiting") {
            return;
        }
        if (waitLeft <= 0) {
            startRinging();
            return;
        }
        const timer = setTimeout(() => setWaitLeft((n) => n - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, waitLeft]);

    // Call duration timer
    useEffect(() => {
        if (phase !== "connected") {
            return;
        }
        const timer = setInterval(() => setElapsed((n) => n + 1), 1000);
        return () => clearInterval(timer);
    }, [phase]);

    // Stop sound and vibration when leaving the page
    useEffect(() => {
        return () => {
            ringtone.stop();
            if (navigator.vibrate) {
                navigator.vibrate(0);
            }
        };
    }, [ringtone]);

    function handleStart(e) {
        e.preventDefault();
        ringtone.prepare();
        setElapsed(0);
        setWaitLeft(delay);
        setPhase("waiting");
    }

    function startRinging() {
        setPhase("ringing");
        ringtone.start();
        if (navigator.vibrate) {
            navigator.vibrate(Array(15).fill([800, 600]).flat());
        }
    }

    function stopAlerts() {
        ringtone.stop();
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    }

    function handleAccept() {
        stopAlerts();
        setPhase("connected");
    }

    function handleEnd() {
        stopAlerts();
        navigate("/");
    }

    const displayName = callerName.trim() || "Unknown";

    if (phase === "setup") {
        return (
            <div className="fc-page">
                <div className="fc-card">
                    <Link to="/" className="fc-back">← Back</Link>
                    <h1>Fake Call</h1>
                    <p className="fc-text">
                        Get a realistic incoming call to help you leave an uncomfortable
                        situation. Keep this screen open until the call arrives.
                    </p>

                    <form className="fc-form" onSubmit={handleStart}>
                        <label>
                            Caller name
                            <input
                                type="text"
                                value={callerName}
                                onChange={(e) => setCallerName(e.target.value)}
                                maxLength={30}
                            />
                        </label>

                        <label>
                            Ring after
                            <select
                                value={delay}
                                onChange={(e) => setDelay(Number(e.target.value))}
                            >
                                <option value={0}>Right now</option>
                                <option value={10}>10 seconds</option>
                                <option value={30}>30 seconds</option>
                                <option value={60}>1 minute</option>
                            </select>
                        </label>

                        <button className="fc-start" type="submit">
                            Start Fake Call
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (phase === "waiting") {
        return (
            <div className="fc-page">
                <div className="fc-card fc-waiting">
                    <h1>Call arriving in</h1>
                    <div className="fc-wait-number">{waitLeft}</div>
                    <p className="fc-text">
                        Keep the screen on. {displayName} will call you shortly.
                    </p>
                    <button className="fc-cancel" onClick={() => setPhase("setup")}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (phase === "ringing") {
        return (
            <div className="fc-call">
                <div>
                    <div className="fc-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    <div className="fc-name">{displayName}</div>
                    <div className="fc-sub">Incoming call...</div>
                </div>

                <div className="fc-actions">
                    <div className="fc-action">
                        <button className="fc-round fc-red" onClick={handleEnd}>
                            ✕
                        </button>
                        Decline
                    </div>
                    <div className="fc-action">
                        <button className="fc-round fc-green" onClick={handleAccept}>
                            📞
                        </button>
                        Accept
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fc-call">
            <div>
                <div className="fc-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div className="fc-name">{displayName}</div>
                <div className="fc-sub">{formatTime(elapsed)}</div>
            </div>

            <div className="fc-actions">
                <div className="fc-action">
                    <button className="fc-round fc-red" onClick={handleEnd}>
                        ✕
                    </button>
                    End call
                </div>
            </div>
        </div>
    );
}

export default FakeCall;