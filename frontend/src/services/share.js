export function getLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

export function mapLinkFor(location) {
    if (!location) return null;
    return "https://www.google.com/maps?q=" + location.latitude + "," + location.longitude;
}

function toWhatsAppNumber(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? "91" + digits : digits;
}

export function whatsappLink(phone, text) {
    return "https://wa.me/" + toWhatsAppNumber(phone) + "?text=" + encodeURIComponent(text);
}

export function smsLink(phone, text) {
    return "sms:" + phone + "?body=" + encodeURIComponent(text);
}

// NEW: Auto-fill SMS for multiple contacts (works on some Android devices)
export function smsLinkAll(contacts, text) {
    if (contacts.length === 0) return "";
    const numbers = contacts.map(c => c.phone).join(";"); // Semicolon separates numbers on Android
    return "sms:" + numbers + "?body=" + encodeURIComponent(text);
}

// NEW: Email All contacts (auto-selects all emails if you have them)
export function emailLinkAll(contacts, text) {
    const emails = contacts.map(c => c.email).filter(Boolean).join(",");
    if (!emails) return null;
    return "mailto:" + emails + "?subject=EMERGENCY ALERT&body=" + encodeURIComponent(text);
}

// Uses the native device share menu (bypasses pop-up blockers)
export async function alertAllContacts(contacts, message) {
    if (contacts.length === 0) return;

    if (navigator.share) {
        try {
            await navigator.share({
                title: '🚨 EMERGENCY ALERT',
                text: message,
            });
        } catch (err) {
            console.log('User cancelled share or share failed', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(message);
            alert("🚨 Emergency message copied to clipboard!\n\nYou can now paste it into WhatsApp or SMS.");
        } catch (err) {
            alert("Could not copy message automatically. Please copy it manually.");
        }
    }
}