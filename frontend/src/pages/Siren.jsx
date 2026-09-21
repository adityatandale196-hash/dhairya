import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createSiren } from "../services/sound";
import "./Siren.css";

function Siren() {
    const [siren] = useState(() => createSiren());
    const [on, setOn] = useState(false);

    // Make sure the siren stops when the user leaves this page
    useEffect(() => {
        return () => siren.stop();
    }, [siren]);

    function handleToggle() {
        if (on) {
            siren.stop();
            setOn(false);
        } else {
            siren.start();
            setOn(true);
        }
    }

    return (
        <div className={on ? "siren-page siren-on" : "siren-page"}>
            <Link to="/" className="siren-back">← Back</Link>

            <h1>Emergency Siren</h1>
            <p className="siren-text">
                Plays a loud siren and flashes the screen to attract attention nearby.
            </p>

            <button
                className={on ? "siren-button siren-button-on" : "siren-button"}
                onClick={handleToggle}
            >
                {on ? "STOP SIREN" : "START SIREN"}
            </button>

            <p className="siren-note">
                Turn your phone volume up and make sure it is not on silent mode.
            </p>
        </div>
    );
}

export default Siren;