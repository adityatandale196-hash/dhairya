import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contacts from "./pages/Contacts";
import Sos from "./pages/Sos";
import FakeCall from "./pages/FakeCall";
import Siren from "./pages/Siren";
import SafetyCheck from "./pages/SafetyCheck";
import SafeTravel from "./pages/SafeTravel";
import LiveLocation from "./pages/LiveLocation";
import About from "./pages/About";

function App() {
    // Apply saved theme on every page load
    useEffect(() => {
        const saved = localStorage.getItem("dhairyaTheme");
        if (saved === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/sos" element={<Sos />} />
                <Route path="/fake-call" element={<FakeCall />} />
                <Route path="/siren" element={<Siren />} />
                <Route path="/safety-check" element={<SafetyCheck />} />
                <Route path="/safe-travel" element={<SafeTravel />} />
                <Route path="/live-location" element={<LiveLocation />} />
                <Route path="/settings" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;