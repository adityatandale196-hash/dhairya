// This grabs the URL from Vercel. If you are testing locally, it falls back to localhost.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiRequest(method, url, body) {
    const options = { method, headers: {} };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    // This is the magic fix: It combines the base URL with the endpoint
    // Example: "https://dhairyaapi.onrender.com" + "/api/users/login"
    const fullUrl = API_BASE_URL + url;

    const response = await fetch(fullUrl, options);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
}

export function postJson(url, body) {
    return apiRequest("POST", url, body);
}