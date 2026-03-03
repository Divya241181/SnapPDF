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
        if (import.meta.env.PROD) {
            console.error('[EmailJS] Skipping email — Missing environment variables on Netlify!');
            console.log('Detected values:', { 
                SERVICE_ID: SERVICE_ID ? '✅ Set' : '❌ Missing', 
                TEMPLATE_ID: TEMPLATE_ID ? '✅ Set' : '❌ Missing', 
                PUBLIC_KEY: PUBLIC_KEY ? '✅ Set' : '❌ Missing' 
            });
        } else {
            console.warn('[EmailJS] Skipping email — env vars not set.');
        }
        return;
    }


    const templateParams = {
        username:    user.username || 'there',
        user_email:  user.email,
        action_type: type === 'signup' ? 'joined' : 'logged in',
        cta_url:     'https://snappdff.netlify.app/',
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

/**
 * Sends a contact inquiry from the 'Contact Us' page.
 * 
 * @param {{ name: string, email: string, subject: string, message: string }} formData
 */
export const sendContactInquiry = async (formData) => {
    // Guard: skip if EmailJS not configured
    if (!SERVICE_ID || !PUBLIC_KEY) {
        console.error('[EmailJS] Cannot send inquiry — Service ID or Public Key missing.');
        return { success: false, error: 'Configuration missing' };
    }

    // NOTE: In a real app, you might want a different Template ID for inquiries.
    // For now, we'll try to use a specific one from env OR failover to the default.
    const CONTACT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID || TEMPLATE_ID;

    if (!CONTACT_TEMPLATE_ID) {
        console.error('[EmailJS] No Template ID found for contact form.');
        return { success: false, error: 'Template ID missing' };
    }

    const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email,
    };

    try {
        await emailjs.send(SERVICE_ID, CONTACT_TEMPLATE_ID, templateParams, {
            publicKey: PUBLIC_KEY,
        });
        console.log('[EmailJS] Inquiry sent successfully');
        return { success: true };
    } catch (err) {
        console.error('[EmailJS] Inquiry failed:', err?.text || err?.message || err);
        return { success: false, error: err?.text || 'Failed to send message' };
    }
};
