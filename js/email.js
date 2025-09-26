// EmailJS integration for Repair Request Form
// Service ID: service_pm88suj
// Template ID: template_skzhgyp
// NOTE: Replace 'YOUR_PUBLIC_KEY_HERE' with your actual public key from EmailJS dashboard (User ID / Public Key)
//       Example key format: rJ1AbCdEfGhI2JkL

(function() {
    const SERVICE_ID = 'service_pm88suj';
    const TEMPLATE_ID = 'template_skzhgyp';
    // Public key supplied by user
    const PUBLIC_KEY = '2MHi3ot_RB3_yzlug';

    // Map form field names to CURRENT EmailJS template variables
    // Template given by user includes:
    // {{name}} {{surname}} {{time}} {{message}} {{device_type}} {{email}} {{number}}
    // (Optional: we still send ticket_number; add {{ticket_number}} to template if you want it rendered.)
    const templateParamsMap = {
        deviceType: 'device_type',
        issueDescription: 'message',
        customerPhone: 'number',
        customerEmail: 'email',
        ticketNumber: 'ticket_number' // optional (not in current template but useful)
    };

    function log(msg, data) {
        console.log('[EmailJS]', msg, data || '');
    }

    function initEmailJS() {
        if (!window.emailjs) {
            log('SDK not yet loaded, retrying...');
            return setTimeout(initEmailJS, 300);
        }
        if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY_HERE') {
            console.warn('[EmailJS] Public key not set. Emails will fail until you update PUBLIC_KEY in js/email.js');
        }
        emailjs.init(PUBLIC_KEY);
        log('Initialized with public key');
        attachFormHandler();
    }

    function attachFormHandler() {
        const form = document.getElementById('repairForm');
        if (!form) {
            log('repairForm not found, aborting');
            return;
        }
        if (form.dataset.emailjsBound) {
            return; // Prevent double binding
        }
        form.dataset.emailjsBound = 'true';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Simple validation (already handled by existing FormHandler, but double-check)
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Build template params
            const formData = new FormData(form);
            const params = {};
            Object.keys(templateParamsMap).forEach(key => {
                if (key === 'ticketNumber') return; // generated below
                const templateVar = templateParamsMap[key];
                params[templateVar] = formData.get(key) || '';
            });

            // Derive name / surname from single customerName field
            const fullName = (formData.get('customerName') || '').trim();
            if (fullName) {
                const [first, ...rest] = fullName.split(/\s+/);
                params['name'] = first || fullName; // template expects {{name}}
                params['surname'] = rest.join(' ') || ''; // template expects {{surname}}
            } else {
                params['name'] = '';
                params['surname'] = '';
            }

            // Human readable time stamp
            params['time'] = new Date().toLocaleString();

            // Generate ticket number (same style as existing logic)
            const ticketNumber = 'GF' + Date.now().toString().slice(-6);
            params[templateParamsMap.ticketNumber] = ticketNumber;

            log('Sending params', params);

            try {
                const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
                log('Email sent success', result.status);

                // Show success via existing FormHandler notification if available
                if (window.FormHandlerInstance && typeof window.FormHandlerInstance.showNotification === 'function') {
                    window.FormHandlerInstance.showNotification(`Repair request sent! Ticket: ${ticketNumber}`, 'success');
                } else {
                    fallbackNotification(`Repair request sent! Ticket: ${ticketNumber}`, 'success');
                }

                form.reset();
            } catch (err) {
                console.error('[EmailJS] Send failed', err);
                if (window.FormHandlerInstance && typeof window.FormHandlerInstance.showNotification === 'function') {
                    window.FormHandlerInstance.showNotification('Failed to send request. Please try again later.', 'error');
                } else {
                    fallbackNotification('Failed to send request. Please try again later.', 'error');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHtml;
            }
        });
    }

    function fallbackNotification(message, type) {
        const colors = { success: '#28a745', error: '#dc3545', info: '#007bff', warning: '#ffc107' };
        const note = document.createElement('div');
        note.style.cssText = `position:fixed;top:20px;right:20px;padding:14px 18px;border-radius:6px;color:#fff;font-weight:600;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0;transform:translateY(-10px);transition:.3s`; 
        note.style.background = colors[type] || colors.info;
        note.textContent = message;
        document.body.appendChild(note);
        requestAnimationFrame(() => {
            note.style.opacity = '1';
            note.style.transform = 'translateY(0)';
        });
        setTimeout(() => {
            note.style.opacity = '0';
            note.style.transform = 'translateY(-10px)';
            setTimeout(() => note.remove(), 300);
        }, 5000);
    }

    // Expose a small API (optional)
    window.GameFixerEmail = {
        resend: () => {
            const form = document.getElementById('repairForm');
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        },
        setPublicKey: (key) => {
            if (key && key !== PUBLIC_KEY) {
                emailjs.init(key);
                log('Public key updated at runtime');
            }
        }
    };

    // Wait for DOMContentLoaded then init
    document.addEventListener('DOMContentLoaded', initEmailJS);
})();
