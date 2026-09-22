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

// Opens WhatsApp for each contact one by one with a delay
export function alertAllContacts(contacts, message) {
    if (contacts.length === 0) return;

    contacts.forEach((contact, index) => {
        setTimeout(() => {
            const url = whatsappLink(contact.phone, message);
            window.open(url, "_blank");
        }, index * 2000); // 2 second gap between each contact
    });
}