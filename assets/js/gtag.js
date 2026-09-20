/* ==========================================================================
   Google Ads — base tag, conversion tracking and enhanced conversions
   King Mobile + Laptop Experts

   Loaded from the <head> of every page, right after the googletagmanager
   script. It lives in a file rather than inline so the Content-Security-
   Policy in vercel.json can stay at script-src 'self' — no 'unsafe-inline'
   and no fragile CSP hash to keep in sync when you edit this.

   ── WHAT YOU MUST FILL IN ────────────────────────────────────────────────
   The tag below is live, but a conversion is only recorded once you paste
   the matching CONVERSION LABEL from Google Ads. Create the conversion
   action first (Google Ads → Goals → Conversions → New conversion action →
   Website), then copy its "send_to" value, which looks like:

       AW-17829939467/AbCdEfGhIjKlMnOpQrS

   and paste it into CONVERSIONS below, replacing REPLACE_WITH_…
   Until then clicks are still pushed to the dataLayer, but nothing is
   reported to Google Ads.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------------ */
  var ADS_ID = "AW-17829939467";

  var CONVERSIONS = {
    // Someone tapped a phone number. This is the primary conversion.
    call:       "AW-17829939467/REPLACE_WITH_CALL_LABEL",
    // Someone asked for directions — a strong intent-to-visit signal.
    directions: "AW-17829939467/REPLACE_WITH_DIRECTIONS_LABEL"
  };

  /* Call reporting (optional — OFF by default).
     Google can swap the number shown on the site for a free forwarding
     number so calls from ads are attributed automatically. It changes the
     number visitors see, so it's your call: set up "Calls from a website"
     in Google Ads, then put its conversion label here and set ENABLED true.
     Every number on the site is swapped, including the sticky call bar. */
  var CALL_REPORTING = {
    ENABLED: false,
    LABEL: "AW-17829939467/REPLACE_WITH_CALL_REPORTING_LABEL",
    DISPLAY_NUMBER: "(613) 206-6060"
  };

  /* ------------------------------------------------------------------
     BASE TAG — this is the snippet Google Ads gave you
     ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());

  var config = {
    // Enhanced conversions. Lets the tag hash and send first-party
    // customer data alongside a conversion so Google can match it to the
    // person who clicked the ad. See setUserData() below for the hook.
    allow_enhanced_conversions: true
  };

  if (CALL_REPORTING.ENABLED && CALL_REPORTING.LABEL.indexOf("REPLACE_WITH") === -1) {
    config.phone_conversion_number = CALL_REPORTING.DISPLAY_NUMBER;
    config.phone_conversion_ids = [CALL_REPORTING.LABEL];
  }

  gtag("config", ADS_ID, config);

  /* ------------------------------------------------------------------
     ENHANCED CONVERSIONS
     Call window.kingTrack.setUserData({...}) with whatever the customer
     has actually typed in, BEFORE the conversion fires. gtag normalises
     and SHA-256 hashes it in the browser — raw values never leave the
     device.

     There is nowhere on this site today that collects these details, so
     nothing calls this yet. Wire it up the moment you add a booking form,
     a repair-status lookup or an email capture:

         kingTrack.setUserData({
           email: "customer@example.com",
           phone: "613 555 0123",
           firstName: "Alex", lastName: "Chen",
           street: "1 Main St", city: "Ottawa",
           region: "ON", postalCode: "K1N 5Y4"
         });

     Only pass details the customer gave you for this purpose.
     ------------------------------------------------------------------ */
  function normalisePhone(value) {
    // Google wants E.164. Assume +1 for 10-digit North American numbers.
    var digits = String(value).replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length === 10) return "+1" + digits;
    if (digits.length === 11 && digits.charAt(0) === "1") return "+" + digits;
    return "+" + digits;
  }

  function setUserData(data) {
    if (!data) return;
    var out = {};

    if (data.email) out.email = String(data.email).trim().toLowerCase();
    if (data.phone) {
      var tel = normalisePhone(data.phone);
      if (tel) out.phone_number = tel;
    }

    var addr = {};
    if (data.firstName)  addr.first_name  = String(data.firstName).trim().toLowerCase();
    if (data.lastName)   addr.last_name   = String(data.lastName).trim().toLowerCase();
    if (data.street)     addr.street      = String(data.street).trim().toLowerCase();
    if (data.city)       addr.city        = String(data.city).trim().toLowerCase();
    if (data.region)     addr.region      = String(data.region).trim().toLowerCase();
    if (data.postalCode) addr.postal_code = String(data.postalCode).replace(/\s/g, "").toUpperCase();
    addr.country = data.country || "CA";

    if (Object.keys(addr).length > 1) out.address = addr;
    if (!Object.keys(out).length) return;

    gtag("set", "user_data", out);
  }

  /* ------------------------------------------------------------------
     CONVERSION EVENTS
     ------------------------------------------------------------------ */
  var warned = {};

  function conversion(key, params) {
    var label = CONVERSIONS[key];

    // Always leave a dataLayer trace, configured or not — it makes the
    // click visible in Tag Assistant while you're still setting labels up.
    window.dataLayer.push({ event: "king_" + key });

    if (!label || label.indexOf("REPLACE_WITH") !== -1) {
      if (!warned[key] && window.console && console.warn) {
        warned[key] = true;
        console.warn("[Google Ads] No conversion label set for \"" + key +
                     "\" — the click was not reported. See assets/js/gtag.js.");
      }
      return;
    }

    var payload = { send_to: label, transport_type: "beacon" };
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
    }
    gtag("event", "conversion", payload);
  }

  /* One delegated listener covers every phone and directions link on the
     page, including the sticky call bar and anything added later. */
  function onClick(e) {
    var el = e.target;
    var link = el && el.closest ? el.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";

    if (href.indexOf("tel:") === 0) {
      conversion("call", { call_source: link.closest(".callbar") ? "sticky_bar" : "page" });
    } else if (href.indexOf("google.com/maps") !== -1) {
      conversion("directions");
    }
  }

  document.addEventListener("click", onClick, true);

  /* ------------------------------------------------------------------
     Public hook
     ------------------------------------------------------------------ */
  window.kingTrack = {
    setUserData: setUserData,
    conversion: conversion
  };
})();
