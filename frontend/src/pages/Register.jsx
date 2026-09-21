import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postJson } from "../services/api";
import dhairyaLogo from "../assets/logo.png";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { ok, data } = await postJson("/api/users/register", form);

            if (ok) {
                navigate("/login", {
                    state: { message: "Registration successful. Please log in." },
                });
            } else {
                setError(data.message || "Registration failed");
            }
        } catch {
            setError("Cannot reach the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <img src={dhairyaLogo} alt="Dhairya Logo" className="auth-logo" />
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join Dhairya and stay safe</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

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
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
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
                        />
                    </label>

                    <label>
                        Password (at least 6 characters)
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </label>

                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : "Register"}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;