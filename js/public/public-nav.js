// Public hamburger menu (home and login pages): sections of the home page and
// the way in, without requiring an account. Links resolve from the site root.
import { readSession } from '../api/session-store.js';
import { getRouteHref } from '../config/routes.js';

function isLoggedIn() {
    try {
        return Boolean(readSession()?.user?.id);
    } catch {
        return false;
    }
}

// <a data-route="key" [data-route-hash="section"]>: href comes from js/config/routes.js.
function applyRouteLinks(root = document) {
    root.querySelectorAll('[data-route]').forEach((link) => {
        const hash = link.dataset.routeHash;
        link.href = getRouteHref(link.dataset.route, hash ? { hash } : {});
    });
}

// Links marked data-account-link lead to login, or to the characters when logged in.
function syncAccountLinks(loggedIn) {
    if (!loggedIn) return;
    document.querySelectorAll('[data-account-link]').forEach((link) => {
        link.dataset.route = 'characterHub';
        if (!link.hasAttribute('data-account-card')) link.textContent = 'Mes personnages';
    });
    document.querySelectorAll('[data-account-title]').forEach((node) => { node.textContent = 'Mes personnages'; });
    document.querySelectorAll('[data-account-text]').forEach((node) => { node.textContent = 'Reprendre le jeu avec ton personnage.'; });
}

export function initPublicNav() {
    if (document.getElementById('publicNav')) return;
    const loggedIn = isLoggedIn();
    syncAccountLinks(loggedIn);
    applyRouteLinks();

    // Home page sections (ids of index.html) + the way in, all through routes.js.
    const links = [
        { href: getRouteHref('publicHome', { hash: 'haut' }), label: 'Accueil' },
        { href: getRouteHref('publicHome', { hash: 'royaumes' }), label: 'Royaumes' },
        { href: getRouteHref('publicHome', { hash: 'glossaire' }), label: 'Glossaire' }
    ];
    const primary = loggedIn
        ? { href: getRouteHref('characterHub'), label: 'Mes personnages' }
        : { href: getRouteHref('login'), label: 'Se connecter' };

    // Reuse the page's own menu button (home top bar) or add a floating one.
    const existingToggle = document.getElementById('publicNavToggle');
    const toggle = existingToggle || document.createElement('button');
    if (!existingToggle) {
        toggle.type = 'button';
        toggle.className = 'public-nav-toggle';
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'publicNav');
        toggle.textContent = '☰';
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'public-nav-backdrop';
    backdrop.hidden = true;

    const nav = document.createElement('nav');
    nav.id = 'publicNav';
    nav.className = 'public-nav';
    nav.setAttribute('aria-label', 'Menu principal');
    nav.hidden = true;

    const title = document.createElement('p');
    title.className = 'public-nav-title';
    title.textContent = 'Astoria';
    nav.appendChild(title);

    [...links, { ...primary, primary: true }].forEach((link) => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        if (link.primary) a.className = 'public-nav-primary';
        nav.appendChild(a);
    });

    const setOpen = (open) => {
        nav.hidden = !open;
        backdrop.hidden = !open;
        // The page must not scroll behind the open menu (body-scroll-lock also
        // handles iOS Safari, which ignores overflow:hidden for touch scrolling).
        const lock = window.bodyScrollLock;
        if (lock) {
            if (open) lock.disableBodyScroll(nav, { reserveScrollBarGap: true });
            else lock.enableBodyScroll(nav);
        } else {
            document.documentElement.style.overflow = open ? 'hidden' : '';
        }
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        if (open) nav.querySelector('a')?.focus();
    };

    toggle.addEventListener('click', () => setOpen(nav.hidden));
    backdrop.addEventListener('click', () => setOpen(false));
    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !nav.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });

    if (!existingToggle) document.body.append(toggle);
    document.body.append(backdrop, nav);
}

initPublicNav();
