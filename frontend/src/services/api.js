// Vercel env var, falls back to localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken() {
    return localStorage.getItem("dhairyaToken");
}

export function setToken(token) {
    if (token) {
        localStorage.setItem("dhairyaToken", token);
    }
}

export function clearToken() {
    localStorage.removeItem("dhairyaToken");
    localStorage.removeItem("dhairyaUser");
}

export async function apiRequest(method, url, body) {
    const options = { method, headers: {} };

    if (body !== undefined && body !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    // Attach Bearer token if we have one
    const token = getToken();
    if (token) {
        options.headers["Authorization"] = "Bearer " + token;
    }

    const fullUrl = API_BASE_URL + url;

    try {
        const response = await fetch(fullUrl, options);

        // 401 → token invalid; clear and redirect to login
        if (response.status === 401) {
            clearToken();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, data };
    } catch (err) {
        // Network error
        return {
            ok: false,
            status: 0,
            data: { success: false, message: "Cannot reach the server. Is the backend running?" }
        };
    }
}

export function postJson(url, body) {
    return apiRequest("POST", url, body);
}