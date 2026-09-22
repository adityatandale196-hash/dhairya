
## 🔗 Live Demo
Experience the app live on any device: [https://dhairya-navy.vercel.app](https://dhairya-navy.vercel.app)

# Dhairya - Smart Women's Safety App

## 🚨 The Problem
In an emergency or when feeling unsafe, manually unlocking a phone, opening an app, and texting multiple people is slow and stressful. Furthermore, if someone is traveling alone and stops responding, there is no automatic system to alert their loved ones or share their live location. Existing safety apps are often reactive rather than proactive.

## 💡 Our Solution
Dhairya is a Progressive Web App (PWA) designed to be a proactive safety companion. It acts as an automated safety net. 
- **Emergency SOS:** With one tap, users can instantly broadcast their live location and an emergency message to all their trusted contacts via WhatsApp, SMS, and Email simultaneously.
- **Automated Check-ins:** The "Safety Check" and "Safe Travel" modes start a countdown timer. If the user fails to confirm they are safe within the time limit, the app automatically escalates the situation and alerts their emergency contacts without the user needing to touch their phone.
- **Cross-Platform:** Being a PWA, it requires no app store download and works instantly on any device (Android, iOS, or Desktop) through the browser.

## ✨ Key Features
- **One-Tap Alert All:** Sends live location and emergency messages to multiple contacts via WhatsApp, SMS, and Email.
- **Safety Check Mode:** Timed check-ins that automatically escalate to emergency contacts if the user doesn't respond.
- **Safe Travel Mode:** Tracks travel time and alerts contacts if the user doesn't confirm arriving safely at their destination.
- **Live Location Sharing:** Integrates Google Maps links into all emergency alerts.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Vite-PWA (Deployed on Vercel)
- **Backend:** Java, Spring Boot (Deployed on Render)
- **Database:** PostgreSQL (Hosted on Render)
- **Third-Party Services:** EmailJS (for automatic email alerts)



*(Note: As the backend is hosted on a free tier, the first request might take 30-50 seconds to "wake up" the server. Please be patient on the first load.)*
