import emailjs from "@emailjs/browser";

const SERVICE_ID = "dhairya_service";
const TEMPLATE_ID = "template_04ypts5";
const PUBLIC_KEY = "bAlbZtRTyT2mVsi_r";

emailjs.init(PUBLIC_KEY);

export async function sendEmergencyEmail(toEmail, toName, fromName, alertType, message) {
    if (!toEmail) {
        console.log("No email for this contact, skipping.");
        return false;
    }

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_email: toEmail,
            to_name: toName,
            from_name: fromName,
            alert_type: alertType,
            message: message,
        });
        console.log("Email sent to", toEmail);
        return true;
    } catch (error) {
        console.error("Email failed for", toEmail, error);
        return false;
    }
}

export async function sendEmailToAll(contacts, fromName, alertType, message) {
    const contactsWithEmail = contacts.filter(
        (c) => c.email && c.email.trim() !== ""
    );

    if (contactsWithEmail.length === 0) {
        return 0;
    }

    const results = await Promise.all(
        contactsWithEmail.map((c) =>
            sendEmergencyEmail(c.email, c.name, fromName, alertType, message)
        )
    );

    return results.filter(Boolean).length;
}