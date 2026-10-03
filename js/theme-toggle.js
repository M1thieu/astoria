(function () {
  // Display modes, cycled by every [data-theme-toggle] button:
  //   light: the site as designed
  //   dark:  "Nuit", a filter that darkens the page but keeps its hues (css/style.css)
  //   soft:  "Doux", warmer and a little dimmer, for tired eyes
  const STORAGE_KEY = "astoria_theme";
  const MODES = ["light", "dark", "soft"];
  const LABELS = {
    light: { icon: "☀", text: "Jour", next: "Passer en mode nuit" },
    dark: { icon: "☾", text: "Nuit", next: "Passer en mode doux" },
    soft: { icon: "◐", text: "Doux", next: "Revenir au mode jour" },
  };
  const root = document.documentElement;

  function readStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return MODES.includes(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  function writeStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore storage issues
    }
  }

  function currentTheme() {
    return MODES.includes(root.dataset.theme) ? root.dataset.theme : "light";
  }

  function applyTheme(next) {
    const value = MODES.includes(next) ? next : "light";
    root.dataset.theme = value;
    if (document.body) {
      document.body.dataset.theme = value;
    }
    writeStoredTheme(value);
    document.querySelectorAll("[data-theme-toggle]").forEach(syncToggle);
  }

  function syncToggle(toggle) {
    if (!toggle) return;
    const theme = currentTheme();
    const label = LABELS[theme];
    toggle.setAttribute("aria-pressed", theme === "light" ? "false" : "true");
    toggle.setAttribute("aria-label", `Affichage : ${label.text}. ${label.next}`);
    toggle.title = label.next;
    toggle.dataset.themeState = theme;
    const icon = toggle.querySelector(".theme-mode-icon");
    const text = toggle.querySelector(".theme-mode-text");
    if (icon) icon.textContent = label.icon;
    if (text) text.textContent = label.text;
  }

  function init(scope) {
    const container = scope || document;
    const toggles = Array.from(container.querySelectorAll("[data-theme-toggle]"));
    if (!toggles.length) return;

    toggles.forEach((toggle) => {
      if (toggle.dataset.bound === "true") return;
      toggle.dataset.bound = "true";
      toggle.classList.add("theme-mode");
      toggle.innerHTML = '<span class="theme-mode-icon" aria-hidden="true"></span><span class="theme-mode-text"></span>';
      toggle.addEventListener("click", () => {
        const index = MODES.indexOf(currentTheme());
        applyTheme(MODES[(index + 1) % MODES.length]);
      });
      syncToggle(toggle);
    });
  }

  applyTheme(readStoredTheme() || currentTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }

  window.initThemeToggle = init;
})();
