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
            const { ok, data } = await apiRequest(
                "GET",
                `/api/contacts?userId=${user.userId}`
            );
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
            const body = { ...form, userId: user.userId };

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
                `/api/contacts/${contact.contactId}?userId=${user.userId}`
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
                <h1>Emergency Contacts</h1>
            </header>

            <main className="contacts-body">

                {/* Add / Edit form */}
                <section className="contacts-card">
                    <h2>{editingId ? "Edit Contact" : "Add Contact"}</h2>

                    <form className="contacts-form" onSubmit={handleSubmit}>
                        {error && <div className="contacts-error">{error}</div>}

                        <label>
                            Name
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
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
                                {saving ? "Saving..." : editingId ? "Update" : "Add Contact"}
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

                {/* Contact list */}
                <section className="contacts-card">
                    <h2>Your Contacts</h2>

                    {loading && <p className="contacts-empty">Loading...</p>}

                    {!loading && contacts.length === 0 && (
                        <p className="contacts-empty">
                            No contacts yet. Add someone you trust above.
                        </p>
                    )}

                    {contacts.map((contact) => (
                        <div className="contact-item" key={contact.contactId}>
                            <div className="contact-info">
                                <h3>{contact.name}</h3>
                                <p>
                                    {contact.phone}
                                    {contact.relationship ? ` · ${contact.relationship}` : ""}
                                </p>
                                {contact.email && (
                                    <p style={{ fontSize: "12px", color: "#7c3aed" }}>
                                        📧 {contact.email}
                                    </p>
                                )}
                                {!contact.email && (
                                    <p style={{ fontSize: "12px", color: "#f59e0b" }}>
                                        ⚠️ No email — add one for auto alerts
                                    </p>
                                )}
                            </div>

                            <div className="contact-buttons">
                                <button
                                    className="contact-edit"
                                    onClick={() => handleEdit(contact)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="contact-delete"
                                    onClick={() => handleDelete(contact)}
                                >
                                    Delete
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