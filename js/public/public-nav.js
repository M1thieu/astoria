// Public hamburger menu (home and login pages): sections of the home page and
// the way in, without requiring an account. Links resolve from the site root.
import { readSession } from '../api/session-store.js';

function isLoggedIn() {
    try {
        return Boolean(readSession()?.user?.id);
    } catch {
        return false;
    }
}

export function initPublicNav() {
    if (document.querySelector('.public-nav-toggle')) return;

    const links = [
        { href: 'index.html#haut', label: 'Accueil' },
        { href: 'index.html#royaumes', label: 'Royaumes' },
        { href: 'index.html#glossaire', label: 'Glossaire' }
    ];
    const primary = isLoggedIn()
        ? { href: 'html/personnages.html', label: 'Mes personnages' }
        : { href: 'html/login.html', label: 'Se connecter' };

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'public-nav-toggle';
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'publicNav');
    toggle.textContent = '☰';

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

    document.body.append(toggle, backdrop, nav);
}

initPublicNav();
