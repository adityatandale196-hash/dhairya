export async function apiRequest(method, url, body) {
    const options = { method, headers: {} };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
}

export function postJson(url, body) {
    return apiRequest("POST", url, body);
}