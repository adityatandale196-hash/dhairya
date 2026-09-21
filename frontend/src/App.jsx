import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contacts from "./pages/Contacts";
import Sos from "./pages/Sos";
import FakeCall from "./pages/FakeCall";
import Siren from "./pages/Siren";
import SafetyCheck from "./pages/SafetyCheck";
import LiveLocation from "./pages/LiveLocation";

function App() {
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
                <Route path="/live-location" element={<LiveLocation />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;