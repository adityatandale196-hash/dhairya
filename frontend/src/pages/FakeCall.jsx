import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./FakeCall.css";

function FakeCall() {
    const [caller, setCaller] = useState("Mom");
    const [delay, setDelay] = useState(5); // Default to 5s for easy testing
    const [phase, setPhase] = useState("setup"); // setup, waiting, ringing, incall
    const [callTime, setCallTime] = useState(0);

    // Use a reference to hold the audio object so it persists across renders
    const audioRef = useRef(null);

    // Call timer logic
    useEffect(() => {
        let interval;
        if (phase === "incall") {
            interval = setInterval(() => setCallTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [phase]);

    // Ringtone and vibration logic
    useEffect(() => {
        if (phase === "ringing") {
            // Strong vibration pattern (5 seconds of vibrating)
            if (navigator.vibrate) navigator.vibrate([1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);

            // Play the pre-loaded audio at full volume
            if (audioRef.current) {
                audioRef.current.volume = 1.0; // Full volume
                audioRef.current.play().catch(e => console.log("Audio play failed", e));
            }
        } else {
            // Stop vibration and audio if we are not ringing
            if (navigator.vibrate) navigator.vibrate(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }

        return () => {
            if (navigator.vibrate) navigator.vibrate(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [phase]);

    function startFakeCall() {
        // 1. UNLOCK THE AUDIO ENGINE
        // We create and play the audio at a tiny volume immediately on click.
        // This tells the browser "the user wants this to play".
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg");
        audioRef.current.volume = 0.01;
        audioRef.current.play().then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }).catch(e => console.log("Audio unlock failed", e));

        // 2. Start the timer
        setPhase("waiting");
        setTimeout(() => {
            setPhase("ringing");
        }, delay * 1000);
    }

    function acceptCall() {
        setPhase("incall");
        setCallTime(0);
    }

    function declineCall() {
        setPhase("setup");
    }

    // --- RENDER SCREENS ---

    if (phase === "setup") {
        return (
            <div className="fakecall-page">
                <Link to="/" className="ll-back" style={{ marginBottom: "20px" }}>← Back</Link>
                <h1>Fake Call</h1>
                <p>Get a realistic incoming call to help you leave an uncomfortable situation.</p>

                <label className="ll-contact-info" style={{ textAlign: "left", width: "100%", maxWidth: "300px" }}>Caller name</label>
                <input type="text" value={caller} onChange={(e) => setCaller(e.target.value)} placeholder="Mom" />

                <label className="ll-contact-info" style={{ textAlign: "left", width: "100%", maxWidth: "300px" }}>Ring after</label>
                <select value={delay} onChange={(e) => setDelay(Number(e.target.value))}>
                    <option value={5}>5 seconds (Demo)</option>
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                </select>

                <button onClick={startFakeCall}>Start Fake Call</button>
            </div>
        );
    }

    if (phase === "waiting") {
        return (
            <div className="fakecall-page">
                <h1>Preparing Fake Call...</h1>
                <p>Keep this screen open. Your phone will ring loudly in {delay} seconds.</p>
            </div>
        );
    }

    if (phase === "ringing") {
        return (
            <div className="fakecall-screen ringing">
                <div className="fakecall-info">
                    <div className="fakecall-avatar">👤</div>
                    <div className="fakecall-name">{caller}</div>
                    <div className="fakecall-status">Incoming call...</div>
                </div>
                <div className="fakecall-actions">
                    <button className="fakecall-btn fakecall-decline" onClick={declineCall}>📞</button>
                    <button className="fakecall-btn fakecall-accept" onClick={acceptCall}>📞</button>
                </div>
            </div>
        );
    }

    if (phase === "incall") {
        const mins = String(Math.floor(callTime / 60)).padStart(2, "0");
        const secs = String(callTime % 60).padStart(2, "0");
        return (
            <div className="fakecall-screen incall">
                <div className="fakecall-info">
                    <div className="fakecall-avatar">👤</div>
                    <div className="fakecall-name">{caller}</div>
                    <div className="fakecall-status">{mins}:{secs}</div>
                </div>
                <div className="fakecall-actions">
                    <button className="fakecall-btn fakecall-decline" onClick={declineCall}>📞</button>
                </div>
            </div>
        );
    }
}

export default FakeCall;