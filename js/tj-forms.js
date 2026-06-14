/**
 * tj-forms.js — Public form submission handler for Twizted Journeys
 *
 * Submits forms directly to Supabase via REST API using the anon key.
 * The anon key is safe to expose — Supabase RLS controls what can be read/written.
 *
 * Falls back to a mailto: link if Supabase is not configured.
 *
 * Usage: include this script on any page with a TJ form.
 * Requires: window.TJ_PUBLIC_CONFIG = { supabaseUrl, supabaseAnonKey }
 *   OR reads from /admin/config.js if TJ_CONFIG is available.
 */

(function() {
  // Get config — works whether loaded from public-config.js or admin config.js
  function getConfig() {
    const c = window.TJ_PUBLIC_CONFIG || window.TJ_CONFIG;
    if (!c || c.supabaseUrl === 'SUPABASE_URL_HERE') return null;
    return c;
  }

  // POST to Supabase table using the REST API (no SDK needed)
  async function postToSupabase(table, payload) {
    const cfg = getConfig();
    if (!cfg) throw new Error('not-configured');
    const res = await fetch(cfg.supabaseUrl + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': cfg.supabaseAnonKey,
        'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return true;
  }

  // Show success state on a form
  function showSuccess(form, message) {
    form.style.display = 'none';
    const div = document.createElement('div');
    div.style.cssText = 'background:rgba(86,224,210,0.08);border:1px solid rgba(86,224,210,0.3);border-radius:10px;padding:28px 24px;text-align:center;';
    div.innerHTML = '<div style="font-size:2rem;margin-bottom:12px;">&#10003;</div><p style="color:#56E0D2;font-weight:700;margin:0 0 8px;">' + message + '</p>';
    form.parentNode.insertBefore(div, form.nextSibling);
  }

  // Show error on a form
  function showError(form, message) {
    let el = form.querySelector('.tj-form-error');
    if (!el) {
      el = document.createElement('div');
      el.className = 'tj-form-error';
      el.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px 14px;color:#f87171;font-size:0.85rem;margin-top:12px;';
      form.appendChild(el);
    }
    el.textContent = message;
    el.style.display = 'block';
  }

  // Set submit button loading state
  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.original = btn.dataset.original || btn.textContent;
    btn.textContent = loading ? 'Sending...' : btn.dataset.original;
  }

  // ── MEMORIAL FORM ─────────────────────────────────────────────────────────
  window.handleMemorialSubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');
    setLoading(btn, true);

    const payload = {
      name:           form.querySelector('[name=name]')?.value?.trim() || '',
      email:          form.querySelector('[name=email]')?.value?.trim() || '',
      message:        form.querySelector('[name=message]')?.value?.trim() || '',
      loved_one_name: form.querySelector('[name=loved_one_name]')?.value?.trim() || null,
      status:         'pending',
      source:         'website-form'
    };

    try {
      await postToSupabase('memorial_submissions', payload);
      showSuccess(form, 'Thank you. Their name has been received.');
      setTimeout(() => { window.location.href = 'memorial-thanks.html'; }, 2000);
    } catch(err) {
      if (err.message === 'not-configured') {
        // Supabase not set up yet — open mailto as fallback
        window.location.href = 'mailto:info@twiztedjourneys.org?subject=Memorial Submission&body=Name: ' + encodeURIComponent(payload.name) + '%0AEmail: ' + encodeURIComponent(payload.email) + '%0ALoved One: ' + encodeURIComponent(payload.loved_one_name||'') + '%0AMessage: ' + encodeURIComponent(payload.message);
      } else {
        showError(form, 'Something went wrong. Please email info@twiztedjourneys.org directly.');
        console.error('Memorial submit error:', err);
      }
      setLoading(btn, false);
    }
  };

  // ── STORY FORM ────────────────────────────────────────────────────────────
  window.handleStorySubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');
    setLoading(btn, true);

    const payload = {
      name:    form.querySelector('[name=name]')?.value?.trim() || '',
      email:   form.querySelector('[name=email]')?.value?.trim() || '',
      story:   form.querySelector('[name=message]')?.value?.trim() || '',
      status:  'pending',
      source:  'website-form'
    };

    try {
      await postToSupabase('story_submissions', payload);
      showSuccess(form, 'Thank you for sharing your journey.');
      setTimeout(() => { window.location.href = 'story-thanks.html'; }, 2000);
    } catch(err) {
      if (err.message === 'not-configured') {
        window.location.href = 'mailto:info@twiztedjourneys.org?subject=Story Submission&body=Name: ' + encodeURIComponent(payload.name) + '%0AEmail: ' + encodeURIComponent(payload.email) + '%0AStory: ' + encodeURIComponent(payload.story);
      } else {
        showError(form, 'Something went wrong. Please email info@twiztedjourneys.org directly.');
      }
      setLoading(btn, false);
    }
  };

  // ── RSVP FORM ─────────────────────────────────────────────────────────────
  window.handleRsvpSubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');
    setLoading(btn, true);

    const payload = {
      name:              form.querySelector('[name=name]')?.value?.trim() || '',
      email:             form.querySelector('[name=email]')?.value?.trim() || '',
      phone:             form.querySelector('[name=phone]')?.value?.trim() || null,
      registration_type: form.querySelector('[name=registration_type]')?.value || 'attendee',
      guests:            form.querySelector('[name=guests]')?.value || '1',
      day1:              form.querySelector('[name=day1]')?.checked || false,
      day2:              form.querySelector('[name=day2]')?.checked || false,
      notes:             form.querySelector('[name=notes]')?.value?.trim() || null,
      event_slug:        'sept-2026',
      source:            'website-form'
    };

    try {
      await postToSupabase('event_registrations', payload);
      showSuccess(form, "You're registered! See you in September.");
      setTimeout(() => { window.location.href = 'rsvp-thanks.html'; }, 2000);
    } catch(err) {
      if (err.message === 'not-configured') {
        window.location.href = 'mailto:info@twiztedjourneys.org?subject=Event RSVP&body=Name: ' + encodeURIComponent(payload.name) + '%0AEmail: ' + encodeURIComponent(payload.email) + '%0AType: ' + encodeURIComponent(payload.registration_type);
      } else {
        showError(form, 'Something went wrong. Please email info@twiztedjourneys.org directly.');
      }
      setLoading(btn, false);
    }
  };


  // ── TWIZTED TREASURE CHECK-IN ─────────────────────────────────────────────
  window.handleTreasureCheckin = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');
    setLoading(btn, true);

    const payload = {
      nickname:  form.querySelector('[name=nickname]')?.value?.trim()   || '',
      city:      form.querySelector('[name=city]')?.value?.trim()       || '',
      state:     form.querySelector('[name=state]')?.value?.trim()      || '',
      item_type: form.querySelector('[name=item_type]')?.value?.trim()  || null,
      message:   form.querySelector('[name=message]')?.value?.trim()    || null,
      email:     form.querySelector('[name=email]')?.value?.trim()      || null,
      source:    'treasure-checkin'
    };

    try {
      await postToSupabase('treasure_checkins', payload);
      showSuccess(form, 'Thank you! The journey continues.');
    } catch(err) {
      if (err.message === 'not-configured') {
        const parts = [
          'Nickname: ' + payload.nickname,
          'City/State: ' + payload.city + ', ' + payload.state,
          'Item: ' + (payload.item_type || ''),
          'Message: ' + (payload.message || ''),
          'Email: ' + (payload.email || '')
        ].join('%0A');
        window.location.href = 'mailto:info@twiztedjourneys.org?subject=Twizted%20Treasure%20Check-In&body=' + parts;
      } else {
        showError(form, 'Something went wrong. Please email info@twiztedjourneys.org directly.');
        console.error('Treasure checkin error:', err);
      }
      setLoading(btn, false);
    }
  };

  // ── PAUSE SPINNER CHECK-IN ────────────────────────────────────────────────
  window.handleSpinnerCheckin = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');
    setLoading(btn, true);

    const payload = {
      nickname:       form.querySelector('[name=nickname]')?.value?.trim()       || '',
      spinner_id:     form.querySelector('[name=spinner_id]')?.value?.trim()     || null,
      feeling_before: form.querySelector('[name=feeling_before]')?.value?.trim() || null,
      feeling_after:  form.querySelector('[name=feeling_after]')?.value?.trim()  || null,
      note:           form.querySelector('[name=note]')?.value?.trim()           || null,
      source:         'spinner-checkin'
    };

    try {
      await postToSupabase('spinner_checkins', payload);
      showSuccess(form, 'Check-in recorded. Thanks for pausing with us.');
    } catch(err) {
      if (err.message === 'not-configured') {
        const parts = [
          'Nickname: ' + payload.nickname,
          'Spinner: ' + (payload.spinner_id || ''),
          'Before: ' + (payload.feeling_before || ''),
          'After: ' + (payload.feeling_after || ''),
          'Note: ' + (payload.note || '')
        ].join('%0A');
        window.location.href = 'mailto:info@twiztedjourneys.org?subject=Pause%20Spinner%20Check-In&body=' + parts;
      } else {
        showError(form, 'Something went wrong. Please email info@twiztedjourneys.org directly.');
        console.error('Spinner checkin error:', err);
      }
      setLoading(btn, false);
    }
  };

})();

