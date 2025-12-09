// This JS is included on the merchant page
(function(){


    // Get the base URL of gateway.js
    let scriptBase;
    if (document.currentScript) {
        // Full URL to gateway.js
        const scriptUrl = new URL(document.currentScript.src);
        // Base URL: folder where gateway.js lives
        scriptBase = scriptUrl.origin + scriptUrl.pathname.replace(/\/[^\/]*$/, '/');
    } else {
        // Fallback if currentScript is null: assume /atlas/ folder
        scriptBase = window.location.origin + '/atlas/';
    }

    // Build URL to tokenize.php relative to gateway.js
    const apiPath = new URL('tokenize.php', scriptBase).href;

    const container = document.getElementById('gateway-card-container');
    if(!container) return;

    // Build inputs wrapped in divs, each with a dedicated class and HTML5 validation
    container.innerHTML = `
        <div class="gw-field gw-field-card-number">
            <label for="gw-card-number">Card Number</label>
         <input type="text"
                   id="gw-card-number"
                   class="gw-input gw-card-number"
                   inputmode="numeric"
                   autocomplete="cc-number"
             pattern="^\\d{16}$"
                   maxlength="16"
                   required
                   oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,16)">
         <small class="gw-error" id="gw-card-number-error" hidden>Enter a 16-digit card number.</small>
        </div>
        <div class="gw-field gw-field-exp-month">
            <label for="gw-exp-month">Exp Month</label>
            <input type="text"
                   id="gw-exp-month"
                   class="gw-input gw-exp-month"
                   inputmode="numeric"
                   autocomplete="cc-exp-month"
                   pattern="^(0[1-9]|1[0-2])$"
                   maxlength="2"
                   required
                   oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)">
            <small class="gw-error" id="gw-exp-month-error" hidden>Use 01â€“12.</small>
        </div>
        <div class="gw-field gw-field-exp-year">
            <label for="gw-exp-year">Exp Year</label>
            <input type="text"
                   id="gw-exp-year"
                   class="gw-input gw-exp-year"
                   inputmode="numeric"
                   autocomplete="cc-exp-year"
                   pattern="^\\d{2}$"
                   maxlength="2"
                   required
                   oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)">
            <small class="gw-error" id="gw-exp-year-error" hidden>Two digits (YY).</small>
        </div>
        <div class="gw-field gw-field-cvc">
            <label for="gw-cvc">CVC</label>
            <input type="text"
                   id="gw-cvc"
                   class="gw-input gw-cvc"
                   inputmode="numeric"
                   autocomplete="cc-csc"
                   pattern="^\\d{3,4}$"
                   maxlength="4"
                   required
                   oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)">
            <small class="gw-error" id="gw-cvc-error" hidden>3â€“4 digits.</small>
        </div>
        <div class="gw-field gw-field-messages">
            <small class="gw-error" id="gw-form-error" hidden></small>
        </div>
    `;

    const form = container.closest('form');
    if(!form) return;
    // Disable native browser validation bubbles; we'll show inline messages under card fields only
    form.setAttribute('novalidate', '');

    // Ensure all error messages start hidden even if page CSS overrides [hidden]
    container.querySelectorAll('.gw-error').forEach(el => {
        el.hidden = true;
        el.style.display = 'none';
    });

    const showError = (id, msg) => {
        const el = document.getElementById(id);
        if (el) {
            const text = msg || '';
            el.textContent = text;
            const show = !!text;
            el.hidden = !show;
            // Inline style wins over external CSS; guarantees visibility toggle
            el.style.display = show ? 'block' : 'none';
        }
    };

    const setFieldError = (inputId, errId, msg) => {
        const input = document.getElementById(inputId);
        showError(errId, msg || '');
        if (input) {
            input.setCustomValidity(msg || '');
        }
    };

    const validateInputs = () => {
        let ok = true;
        const number = document.getElementById('gw-card-number');
        const month  = document.getElementById('gw-exp-month');
        const year   = document.getElementById('gw-exp-year');
        const cvc    = document.getElementById('gw-cvc');

        // Reset
        ['gw-card-number','gw-exp-month','gw-exp-year','gw-cvc'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setCustomValidity('');
        });
        ['gw-card-number-error','gw-exp-month-error','gw-exp-year-error','gw-cvc-error','gw-form-error']
            .forEach(id => showError(id, ''));

        // Presence
        if (!number.value) { setFieldError('gw-card-number','gw-card-number-error','Card number is required.'); ok = false; }
        if (!month.value)  { setFieldError('gw-exp-month','gw-exp-month-error','Exp month is required.'); ok = false; }
        if (!year.value)   { setFieldError('gw-exp-year','gw-exp-year-error','Exp year is required.'); ok = false; }
        if (!cvc.value)    { setFieldError('gw-cvc','gw-cvc-error','CVC is required.'); ok = false; }

        // Patterns
        const patterns = {
            number: /^\d{16}$/,
            month: /^(0[1-9]|1[0-2])$/,
            year: /^\d{2}$/,
            cvc: /^\d{3,4}$/
        };
        if (number.value && !patterns.number.test(number.value)) {
            setFieldError('gw-card-number','gw-card-number-error','Enter a 16-digit card number.'); ok = false;
        }
        if (month.value && !patterns.month.test(month.value)) {
            setFieldError('gw-exp-month','gw-exp-month-error','Use 01â€“12.'); ok = false;
        }
        if (year.value && !patterns.year.test(year.value)) {
            setFieldError('gw-exp-year','gw-exp-year-error','Two digits (YY).'); ok = false;
        }
        if (cvc.value && !patterns.cvc.test(cvc.value)) {
            setFieldError('gw-cvc','gw-cvc-error','3â€“4 digits.'); ok = false;
        }

        if (!ok) {
            showError('gw-form-error', 'Please correct the highlighted fields.');
        }
        return ok;
    };

    form.addEventListener('submit', async (e)=>{
        e.preventDefault();

        if (!validateInputs()) {
            // Dispatch a custom event when validation fails
            window.dispatchEvent(new CustomEvent('token-null', {
                detail: { message: 'Input validation failed.' }
            }));
            return;
        }

        const cardData = {
            number: document.getElementById('gw-card-number').value,
            month: document.getElementById('gw-exp-month').value,
            year: document.getElementById('gw-exp-year').value,
            cvc: document.getElementById('gw-cvc').value
        };

        // Build same-origin path to tokenizer relative to this script (/.../atlas/tokenize.php)

        const res = await fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify(cardData)
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = { error: 'Unexpected response from tokenization service.' };
        }
        if (!res.ok || data.error) {
            // No alerts; surface an event + inline error for the host page to handle UI
            showError('gw-form-error', data.error || `Tokenization failed (${res.status}).`);
            window.dispatchEvent(new CustomEvent('gw:token-error', { detail: { status: res.status, error: data.error || 'Tokenization failed' } }));
            return;
        }

        // Avoid putting tokens in the URL. Populate hidden field and notify the page.
        const tokenEl = document.getElementById('gw-token');
        if (tokenEl) tokenEl.value = data.token;

        const amountEl = form.querySelector('[name="amount"]');
        const merchantEl = document.getElementById('gw-merchant');

        // Dispatch an event so the host page can continue the flow (e.g., call transact endpoint)
        window.dispatchEvent(new CustomEvent('gw:token-ready', {
            detail: {
                token: data.token,
                amount: amountEl ? amountEl.value : undefined,
                merchant: merchantEl && merchantEl.value ? merchantEl.value : undefined
            }
        }));
    });
})();