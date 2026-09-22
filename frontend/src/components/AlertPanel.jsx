import { whatsappLink, smsLink, alertAllContacts } from "../services/share";
import { Link } from "react-router-dom";

function AlertPanel({ contacts, message, className = "" }) {
    if (contacts.length === 0) {
        return (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
                No emergency contacts yet.{" "}
                <Link to="/contacts" style={{ color: "#7c3aed", fontWeight: 700 }}>
                    Add contacts
                </Link>
            </p>
        );
    }

    return (
        <div className={className}>
            {/* One-tap alert all button */}
            <button
                onClick={() => alertAllContacts(contacts, message)}
                style={{
                    width: "100%",
                    padding: "16px",
                    marginBottom: "14px",
                    border: "none",
                    borderRadius: "14px",
                    background: "#dc2626",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 700,
                }}
            >
                🚨 Alert All Contacts at Once
            </button>

            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px", textAlign: "center" }}>
                Opens WhatsApp for each contact automatically. Tap Send in each chat.
            </p>

            {/* Individual buttons */}
            {contacts.map((c) => (
                <div
                    key={c.contactId}
                    style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #edf0f4",
                    }}
                >
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>{c.name}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                        {c.phone}{c.relationship ? " · " + c.relationship : ""}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>

                        href={whatsappLink(c.phone, message)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                        flex: 1, padding: "10px 6px", borderRadius: "12px",
                        textAlign: "center", fontSize: "14px", fontWeight: 700,
                        textDecoration: "none", color: "#ffffff", background: "#16a34a"
                    }}
                        >
                        WhatsApp
                    </a>

                    href={smsLink(c.phone, message)}
                    style={{
                    flex: 1, padding: "10px 6px", borderRadius: "12px",
                    textAlign: "center", fontSize: "14px", fontWeight: 700,
                    textDecoration: "none", color: "#ffffff", background: "#7c3aed"
                }}
                    >
                    SMS
                </a>

                href={"tel:" + c.phone}
                style={{
                flex: 1, padding: "10px 6px", borderRadius: "12px",
                textAlign: "center", fontSize: "14px", fontWeight: 700,
                textDecoration: "none", color: "#ffffff", background: "#374151"
            }}
                >
                Call
                </a>
                </div>
                </div>
                ))}
</div>
);
}

export default AlertPanel;