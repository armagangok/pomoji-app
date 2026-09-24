// Pomoji site: the napping hero owl and the companion tabs.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------- Pomo
  var stage = document.querySelector(".stage");
  var button = document.querySelector(".pomo-button");
  var pomo = document.getElementById("pomo");
  if (stage && button && pomo) {
    var bubble = stage.querySelector(".bubble");
    var pupils = pomo.querySelector(".h-pupils");
    var lines = [
      "Hoo! Ready to focus?",
      "Pick a target. I'll guard the clock.",
      "25 minutes. You've got this.",
      "Wide awake. Let's go!",
      "One session at a time.",
      "Hoo-ray! Again?"
    ];
    var lineIndex = 0;
    var awake = false;
    var sleepTimer = null;
    var flapTimer = null;

    function flap() {
      if (reduceMotion) return;
      pomo.classList.remove("flapping");
      // Restart the flap animation even when it's already running.
      void pomo.getBoundingClientRect();
      pomo.classList.add("flapping");
      clearTimeout(flapTimer);
      flapTimer = setTimeout(function () { pomo.classList.remove("flapping"); }, 1900);
    }

    function scheduleSleep() {
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(function () {
        pomo.classList.add("yawning");
        bubble.textContent = "Yawn… nap time.";
        sleepTimer = setTimeout(fallAsleep, 1100);
      }, 9000);
    }

    function wake() {
      awake = true;
      pomo.classList.add("awake");
      pomo.classList.remove("yawning");
      stage.classList.add("awake");
      bubble.textContent = lines[lineIndex % lines.length];
      lineIndex += 1;
      button.setAttribute("aria-label", "Pomo is awake. Tap to make Pomo flap again");
      flap();
      scheduleSleep();
    }

    function fallAsleep() {
      awake = false;
      pomo.classList.remove("awake", "flapping", "yawning");
      stage.classList.remove("awake");
      bubble.textContent = "";
      if (pupils) pupils.style.transform = "";
      button.setAttribute("aria-label", "Wake Pomo up");
    }

    button.addEventListener("click", wake);

    // Pupils follow the pointer while Pomo is awake.
    function look(clientX, clientY) {
      if (!awake || !pupils || reduceMotion) return;
      var box = pomo.getBoundingClientRect();
      var scale = box.width / 400;
      var eyeX = box.left + 200 * scale;
      var eyeY = box.top + 176 * scale;
      var dx = clientX - eyeX;
      var dy = clientY - eyeY;
      var distance = Math.sqrt(dx * dx + dy * dy) || 1;
      var reach = Math.min(14, distance / (8 * scale));
      pupils.style.transform = "translate(" + (dx / distance) * reach + "px," + (dy / distance) * reach + "px)";
    }
    window.addEventListener("pointermove", function (e) { look(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener("pointerdown", function (e) { look(e.clientX, e.clientY); }, { passive: true });
  }

  // ---------------------------------------------------------------- companion tabs
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }
})();
