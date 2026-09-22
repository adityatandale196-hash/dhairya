import { useState } from "react";
import { Link } from "react-router-dom";
import "./FakeCall.css";

function FakeCall() {
    const [caller, setCaller] = useState("Mom");
    const [delay, setDelay] = useState(10);
    const [started, setStarted] = useState(false);

    function startFakeCall() {
        setStarted(true);
        setTimeout(() => {
            // Trigger fake call UI
            alert("Incoming call from " + caller);
        }, delay * 1000);
    }

    return (
        <div className="fakecall-page">
            <Link to="/" className="ll-back" style={{ marginBottom: "20px" }}>← Back</Link>
            <h1>Fake Call</h1>
            <p>Get a realistic incoming call to help you leave an uncomfortable situation. Keep this screen open until the call arrives.</p>

            <label className="ll-contact-info" style={{ textAlign: "left", width: "100%", maxWidth: "300px" }}>Caller name</label>
            <input
                type="text"
                value={caller}
                onChange={(e) => setCaller(e.target.value)}
                placeholder="Mom"
            />

            <label className="ll-contact-info" style={{ textAlign: "left", width: "100%", maxWidth: "300px" }}>Ring after</label>
            <select value={delay} onChange={(e) => setDelay(Number(e.target.value))}>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
            </select>

            <button onClick={startFakeCall} disabled={started}>
                {started ? "Call Scheduled..." : "Start Fake Call"}
            </button>
        </div>
    );
}

export default FakeCall;