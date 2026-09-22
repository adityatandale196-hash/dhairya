import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Contacts.css";

function Contacts() {
    const stored = localStorage.getItem("dhairyaUser");
    const user = stored ? JSON.parse(stored) : null;

    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [relationship, setRelationship] = useState("");

    async function loadContacts() {
        if (!user) return;
        const res = await apiRequest("GET", "/api/contacts?userId=" + user.userId);
        if (res.ok) setContacts(res.data);
    }

    useEffect(() => { loadContacts(); }, []);

    async function handleAdd() {
        if (!name || !phone) return;
        const res = await apiRequest("POST", "/api/contacts", {
            userId: user.userId, name, phone, relationship
        });
        if (res.ok) {
            setName(""); setPhone(""); setRelationship("");
            loadContacts();
        }
    }

    async function handleDelete(id) {
        await apiRequest("DELETE", "/api/contacts/" + id + "?userId=" + user.userId);
        loadContacts();
    }

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="contacts-page">
            <header className="contacts-header">
                <Link to="/">← Back</Link>
                <h1>Emergency Contacts</h1>
            </header>

            <main className="contacts-body">
                <div className="contact-card">
                    <h3>Add Contact</h3>
                    <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <input placeholder="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
                    <button className="add-contact-btn" onClick={handleAdd}>Add Contact</button>
                </div>

                <h3>Your Contacts</h3>
                {contacts.map((c) => (
                    <div className="contact-card" key={c.contactId}>
                        <div className="ll-contact-name">{c.name}</div>
                        <div className="ll-contact-info">{c.phone} · {c.relationship}</div>
                        <div className="contact-actions">
                            <button className="edit-btn">Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(c.contactId)}>Delete</button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default Contacts;