import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./FakeCall.css";

function FakeCall() {
    const [caller, setCaller] = useState("Mom");
    const [delay, setDelay] = useState(5);
    const [phase, setPhase] = useState("setup");
    const [callTime, setCallTime] = useState(0);

    const audioCtxRef = useRef(null);
    const ringIntervalRef = useRef(null);

    // Call timer
    useEffect(() => {
        let interval;
        if (phase === "incall") {
            interval = setInterval(() => setCallTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [phase]);

    // Ringtone and Vibration Logic
    useEffect(() => {
        if (phase === "ringing") {
            if (navigator.vibrate) {
                navigator.vibrate([1000, 1000, 1000, 1000, 1000, 1000]);
            }
            startRinging();
        } else {
            if (navigator.vibrate) navigator.vibrate(0);
            stopRinging();
        }

        return () => {
            if (navigator.vibrate) navigator.vibrate(0);
            stopRinging();
        };
    }, [phase]);

    function startRinging() {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;

        const playRing = () => {
            // Create a loud dual-tone ring (Classic telephone sound)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.value = 440; // Standard dial tone
            osc2.type = 'sine';
            osc2.frequency.value = 480; // Standard dial tone

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            const now = ctx.currentTime;
            // Make it LOUD
            gainNode.gain.setValueAtTime(0.8, now);
            // Ring for 1.5 seconds, then silence for 0.5 seconds
            gainNode.gain.setValueAtTime(0.8, now + 1.5);
            gainNode.gain.setValueAtTime(0, now + 1.5);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 2);
            osc2.stop(now + 2);
        };

        // Play the ring sound immediately, then repeat every 2 seconds
        playRing();
        ringIntervalRef.current = setInterval(playRing, 2000);
    }

    function stopRinging() {
        if (ringIntervalRef.current) {
            clearInterval(ringIntervalRef.current);
            ringIntervalRef.current = null;
        }
    }

    function startFakeCall() {
        // 1. UNLOCK AUDIO CONTEXT
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

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