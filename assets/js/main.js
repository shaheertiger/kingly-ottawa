/* ==========================================================================
   Kingly Ottawa — site behaviour
   Vanilla JS, no dependencies. Safe to defer.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG — the only place you need to edit opening hours.
     Keep this in sync with:
       • the <table class="hours"> markup, and
       • the "openingHoursSpecification" block in each page's JSON-LD.
     Times are 24h "HH:MM" in Ottawa local time. Use null for a closed day.
     ------------------------------------------------------------------ */
  var TIMEZONE = "America/Toronto";
  var HOURS = {
    0: { open: "11:00", close: "17:00" }, // Sunday
    1: { open: "10:00", close: "19:00" },
    2: { open: "10:00", close: "19:00" },
    3: { open: "10:00", close: "19:00" },
    4: { open: "10:00", close: "19:00" },
    5: { open: "10:00", close: "19:00" },
    6: { open: "10:00", close: "18:00" }  // Saturday
  };

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     1. Mobile navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = $(".nav-toggle");
    var menu   = $("#mobile-menu");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    // Close on navigation, Escape, or resize up to desktop.
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 992) close();
    });
  }

  /* ------------------------------------------------------------------
     2. Header shadow once the page scrolls
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = $(".header");
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     3. Opening hours — "Open now" badge + today's row
     Always evaluated in Ottawa time, never the visitor's timezone.
     ------------------------------------------------------------------ */
  function ottawaNow() {
    // Returns { day: 0-6, minutes: minutes-since-midnight } in Ottawa.
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }).formatToParts(new Date());

      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });

      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day  = days[map.weekday];
      if (day === undefined) return null;

      return { day: day, minutes: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
    } catch (err) {
      return null; // Intl/timeZone unsupported — fall back to static markup.
    }
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":");
    return parseInt(bits[0], 10) * 60 + parseInt(bits[1], 10);
  }

  function pretty(hhmm) {
    var m = toMinutes(hhmm);
    var h = Math.floor(m / 60);
    var min = m % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min ? ":" + String(min).padStart(2, "0") : "") + suffix;
  }

  function initHours() {
    var now = ottawaNow();
    if (!now) return;

    // Highlight today's row in any hours table.
    $$("table.hours tr[data-day]").forEach(function (row) {
      var days = row.getAttribute("data-day").split(",").map(Number);
      row.classList.toggle("is-today", days.indexOf(now.day) !== -1);
    });

    var badges = $$("[data-open-status]");
    if (!badges.length) return;

    var today = HOURS[now.day];
    var isOpen = false;
    var label;

    if (today) {
      var open = toMinutes(today.open);
      var close = toMinutes(today.close);
      isOpen = now.minutes >= open && now.minutes < close;

      if (isOpen) {
        var left = close - now.minutes;
        label = left <= 60
          ? "Open now · closing at " + pretty(today.close)
          : "Open now · until " + pretty(today.close);
      } else if (now.minutes < open) {
        label = "Closed · opens at " + pretty(today.open);
      }
    }

    if (!isOpen && !label) {
      // Closed for the day — find the next day we're open.
      for (var i = 1; i <= 7; i++) {
        var d = (now.day + i) % 7;
        if (HOURS[d]) {
          var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          var when = i === 1 ? "tomorrow" : names[d];
          label = "Closed · opens " + when + " at " + pretty(HOURS[d].open);
          break;
        }
      }
    }

    badges.forEach(function (badge) {
      var text = $(".status-text", badge);
      if (text && label) text.textContent = label;
      badge.classList.add(isOpen ? "is-open" : "is-closed");
    });
  }

  /* ------------------------------------------------------------------
     4. Reveal on scroll
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el, i) {
      // Small stagger for items that share a row.
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     5. Sticky mobile call bar — appears once the hero CTAs scroll away
     ------------------------------------------------------------------ */
  function initCallBar() {
    var bar = $(".callbar");
    if (!bar) return;
    var ticking = false;

    function update() {
      bar.classList.toggle("is-visible", window.scrollY > 420);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     6. Quote / contact form
     Progressive enhancement: the form works as a normal POST without JS.
     With JS we submit in the background and keep the visitor on the page.
     ------------------------------------------------------------------ */
  function initForms() {
    $$("form[data-ajax]").forEach(function (form) {
      var status = $(".form-status", form);
      var button = $("button[type=submit]", form);

      form.addEventListener("submit", function (e) {
        var action = form.getAttribute("action") || "";

        // Not configured yet? Don't pretend it sent — send them to the phone.
        if (!action || action.indexOf("YOUR_FORM_ID") !== -1) {
          e.preventDefault();
          if (status) {
            status.setAttribute("data-state", "err");
            status.textContent = "Online form isn't connected yet — please call (613) 206-6060 and we'll sort you out right away.";
          }
          return;
        }

        e.preventDefault();
        var original = button ? button.innerHTML : "";
        if (button) { button.disabled = true; button.textContent = "Sending…"; }
        if (status) { status.removeAttribute("data-state"); status.textContent = ""; }

        fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Bad response");
            form.reset();
            if (status) {
              status.setAttribute("data-state", "ok");
              status.textContent = "Thanks! We’ve got your request and will text or call you back shortly.";
            }
          })
          .catch(function () {
            if (status) {
              status.setAttribute("data-state", "err");
              status.textContent = "Couldn’t send that — please call (613) 206-6060 instead.";
            }
          })
          .then(function () {
            if (button) { button.disabled = false; button.innerHTML = original; }
          });
      });
    });
  }

  /* ------------------------------------------------------------------
     7. Footer year
     ------------------------------------------------------------------ */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    initNav();
    initHeader();
    initHours();
    initReveal();
    initCallBar();
    initForms();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
