import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Contacts.css";

const emptyForm = { name: "", phone: "", email: "", relationship: "" };

function Contacts() {
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [contacts, setContacts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadContacts();
        }
    }, []);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    async function loadContacts() {
        try {
            const { ok, data } = await apiRequest("GET", "/api/contacts");
            if (ok) {
                setContacts(data);
            } else {
                setError(data.message || "Could not load contacts");
            }
        } catch {
            setError("Cannot reach the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const body = { ...form };

            const { ok, data } = editingId
                ? await apiRequest("PUT", `/api/contacts/${editingId}`, body)
                : await apiRequest("POST", "/api/contacts", body);

            if (ok) {
                setForm(emptyForm);
                setEditingId(null);
                await loadContacts();
            } else {
                setError(data.message || "Could not save contact");
            }
        } catch {
            setError("Cannot reach the server. Is the backend running?");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(contact) {
        setForm({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || "",
            relationship: contact.relationship || "",
        });
        setEditingId(contact.contactId);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleCancelEdit() {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    }

    async function handleDelete(contact) {
        if (!window.confirm(`Delete ${contact.name}?`)) {
            return;
        }

        try {
            const { ok, data } = await apiRequest(
                "DELETE",
                `/api/contacts/${contact.contactId}`
            );
            if (ok) {
                await loadContacts();
            } else {
                setError(data.message || "Could not delete contact");
            }
        } catch {
            setError("Cannot reach the server. Is the backend running?");
        }
    }

    return (
        <div className="contacts-page">
            <header className="contacts-header">
                <Link to="/" className="contacts-back">← Back</Link>
                <h1>Trusted Circle</h1>
                <p className="contacts-subtitle">
                    People who receive your emergency alerts
                </p>
            </header>

            <main className="contacts-body">

                <section className="contacts-card">
                    <h2 className="contacts-card-title">
                        {editingId ? "✏️ Edit Contact" : "➕ Add Contact"}
                    </h2>

                    <form className="contacts-form" onSubmit={handleSubmit}>
                        {error && <div className="contacts-error">{error}</div>}

                        <label>
                            Name
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Mom"
                                required
                            />
                        </label>

                        <label>
                            Phone
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                maxLength={15}
                                placeholder="10-digit mobile number"
                                required
                            />
                        </label>

                        <label>
                            Email (for automatic alerts)
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="optional but recommended"
                            />
                        </label>

                        <label>
                            Relationship
                            <select
                                name="relationship"
                                value={form.relationship}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                                <option value="Sister">Sister</option>
                                <option value="Brother">Brother</option>
                                <option value="Friend">Friend</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>

                        <div className="contacts-actions">
                            <button
                                className="contacts-primary"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : editingId ? "💾 Update" : "➕ Add Contact"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="contacts-secondary"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="contacts-card">
                    <h2 className="contacts-card-title">
                        👥 Your Trusted Circle ({contacts.length})
                    </h2>

                    {loading && <p className="contacts-empty">Loading...</p>}

                    {!loading && contacts.length === 0 && (
                        <p className="contacts-empty">
                            No contacts yet. Add someone you trust above.
                        </p>
                    )}

                    {contacts.map((contact) => (
                        <div className="contact-item" key={contact.contactId}>
                            <div className="contact-avatar">
                                {contact.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="contact-info">
                                <h3>{contact.name}</h3>
                                <p className="contact-phone">{contact.phone}</p>
                                {contact.relationship && (
                                    <span className="contact-tag">{contact.relationship}</span>
                                )}
                                {contact.email ? (
                                    <p className="contact-email">📧 {contact.email}</p>
                                ) : (
                                    <p className="contact-warning">
                                        ⚠️ No email — add for auto alerts
                                    </p>
                                )}
                            </div>

                            <div className="contact-buttons">
                                <button
                                    className="contact-edit"
                                    onClick={() => handleEdit(contact)}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="contact-delete"
                                    onClick={() => handleDelete(contact)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </section>

            </main>
        </div>
    );
}

export default Contacts;