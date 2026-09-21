import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { postJson } from "../services/api";
import dhairyaLogo from "../assets/logo.png";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const successMessage = location.state?.message;

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { ok, data } = await postJson("/api/users/login", form);

            if (ok) {
                localStorage.setItem("dhairyaUser", JSON.stringify(data.user));
                navigate("/");
            } else {
                setError(data.message || "Login failed");
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
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to your Dhairya account</p>

                {successMessage && <div className="auth-success">{successMessage}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

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
                        Password
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : "Login"}
                    </button>
                </form>

                <p className="auth-link">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;