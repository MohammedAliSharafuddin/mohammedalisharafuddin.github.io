/* assets/js/flag-counter.js
   On-page flag counter.

   Reads assets/data/flag-counts.json, which R/fetch_ga4_countries.R writes
   from the GA4 Data API at render time. Nothing here talks to Google, or to
   any third party. The page fetches one static JSON file of aggregate
   country counts from its own origin, so the counter sets no cookie, sends
   no visitor data anywhere, and needs no consent of its own.

   Flags are drawn as emoji built from the ISO 3166-1 alpha-2 code, so there
   are no flag images to request and no sprite sheet to ship.

   Drop <div id="flag-counter"></div> on any page to render it. If the JSON
   is missing, empty, or unreadable, the element stays empty rather than
   showing a broken widget or a zero that looks like real data. */
(function (window, document) {
  "use strict";

  var MOUNT = "flag-counter";
  var DATA = "/assets/data/flag-counts.json";
  var TOP_N = 12;

  /* Regional indicator symbols: 'A' (0x41) maps to 0x1F1E6. */
  function flagEmoji(code) {
    if (!/^[A-Za-z]{2}$/.test(code)) { return ""; }
    var cc = code.toUpperCase();
    return String.fromCodePoint(
      0x1f1e6 + cc.charCodeAt(0) - 65,
      0x1f1e6 + cc.charCodeAt(1) - 65
    );
  }

  function num(n) {
    try { return Number(n).toLocaleString("en-GB"); }
    catch (e) { return String(n); }
  }

  function render(mount, data) {
    var list = (data && data.countries) || [];
    if (!list.length) { return; }

    var shown = list.slice(0, TOP_N);
    var rest = list.length - shown.length;

    var html =
      '<div class="flag-counter">' +
      '<h2 class="flag-counter-title">' +
      (data.title || "Where readers come from") + "</h2>" +
      '<p class="flag-counter-total">' +
      num(data.total) + " " + (data.metric_label || "visitors") + " from " +
      num(list.length) + (list.length === 1 ? " country" : " countries") +
      "</p><ul class=\"flag-counter-list\">";

    shown.forEach(function (c) {
      var flag = flagEmoji(c.code);
      html +=
        '<li class="flag-counter-item">' +
        '<span class="flag-counter-flag" role="img" aria-label="' +
        String(c.name).replace(/"/g, "&quot;") + '">' + flag + "</span>" +
        '<span class="flag-counter-name">' + c.name + "</span>" +
        '<span class="flag-counter-count">' + num(c.count) + "</span>" +
        "</li>";
    });

    html += "</ul>";
    if (rest > 0) {
      html += '<p class="flag-counter-rest">and ' + num(rest) + " more</p>";
    }
    html +=
      '<p class="flag-counter-note">Aggregate counts from this site\'s ' +
      "analytics, updated when the site is rebuilt. No individual visitor is " +
      'identified. See the <a href="/privacy.html">privacy ' +
      "policy</a>.</p></div>";
    html = html.replace("Aggregate counts from this site's analytics",
      "Aggregate counts from " + (data.source_label || "this site's analytics"));

    mount.innerHTML = html;
  }

  function init() {
    var mount = document.getElementById(MOUNT);
    if (!mount) { return; }

    fetch(DATA, { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) { render(mount, d); } })
      .catch(function () {
        /* Missing or malformed data leaves the mount empty on purpose. A
           counter showing zero would read as a real measurement. */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
