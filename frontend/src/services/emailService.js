import emailjs from '@emailjs/browser';

// ─── EmailJS Configuration ───────────────────────────────────────────────────
// Get these values from https://dashboard.emailjs.com
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends a personalized welcome/login greeting email to the user.
 * Called silently after successful signup or login — errors won't disrupt the auth flow.
 *
 * @param {{ username: string, email: string }} user
 * @param {'signup' | 'login'} type
 */
export const sendWelcomeEmail = async (user, type = 'signup') => {
    // Guard: skip if EmailJS not configured (dev environment without keys)
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('[EmailJS] Skipping email — env vars not set.');
        return;
    }

    const templateParams = {
        username:    user.username || 'there',
        user_email:  user.email,
        action_type: type === 'signup' ? 'joined' : 'logged in',
        cta_url:     'https://divya241181.github.io/SnapPDF/',
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
            publicKey: PUBLIC_KEY,
        });
        console.log(`[EmailJS] Welcome email sent to ${user.email}`);
    } catch (err) {
        // Silent — email failure must never break the auth flow
        console.warn('[EmailJS] Email send failed:', err?.text || err?.message || err);
    }
};
