import { whatsappLink, smsLink, alertAllContacts, smsLinkAll } from "../services/share";
import { Link } from "react-router-dom";

function AlertPanel({ contacts, message, className = "" }) {
    if (contacts.length === 0) {
        return (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                No emergency contacts yet.{" "}
                <Link to="/contacts" style={{ color: "#7c3aed", fontWeight: 700 }}>
                    Add contacts
                </Link>
            </p>
        );
    }

    const smsAllUrl = smsLinkAll(contacts, message);

    return (
        <div className={className}>
            {/* Primary Alert All Button */}
            <button
                onClick={() => alertAllContacts(contacts, message)}
                style={{
                    width: "100%",
                    padding: "18px",
                    marginBottom: "12px",
                    border: "none",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                }}
            >
                🚨 Alert All Contacts (Share Menu)
            </button>

            {/* SMS All Button */}
            {smsAllUrl && (
                <a
                    href={smsAllUrl}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "16px",
                        marginBottom: "14px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                        color: "#ffffff",
                        fontSize: "15px",
                        fontWeight: "bold",
                        textDecoration: "none",
                        boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
                    }}
                >
                    📱 SMS All (Auto-fill)
                </a>
            )}

            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", textAlign: "center" }}>
                "Share Menu" opens WhatsApp with multiple contacts. "SMS All" tries to pre-fill all numbers.
            </p>

            {/* Individual Contact Buttons */}
            {contacts.map((c) => (
                <div
                    key={c.contactId}
                    style={{
                        padding: "16px 0",
                        borderBottom: "1px solid var(--border-color)",
                    }}
                >
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)" }}>{c.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                        {c.phone}{c.relationship ? " · " + c.relationship : ""}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <a
                            href={whatsappLink(c.phone, message)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                flex: 1, padding: "12px 6px", borderRadius: "12px",
                                textAlign: "center", fontSize: "14px", fontWeight: "bold",
                                textDecoration: "none", color: "#ffffff",
                                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                boxShadow: "0 4px 10px rgba(22, 163, 74, 0.3)"
                            }}
                        >
                            WhatsApp
                        </a>

                        <a
                            href={smsLink(c.phone, message)}
                            style={{
                                flex: 1, padding: "12px 6px", borderRadius: "12px",
                                textAlign: "center", fontSize: "14px", fontWeight: "bold",
                                textDecoration: "none", color: "#ffffff",
                                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                                boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
                            }}
                        >
                            SMS
                        </a>

                        <a
                            href={"tel:" + c.phone}
                            style={{
                                flex: 1, padding: "12px 6px", borderRadius: "12px",
                                textAlign: "center", fontSize: "14px", fontWeight: "bold",
                                textDecoration: "none", color: "#ffffff",
                                background: "linear-gradient(135deg, #4b5563, #374151)",
                                boxShadow: "0 4px 10px rgba(55, 65, 81, 0.3)"
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