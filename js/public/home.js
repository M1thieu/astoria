// Public home page: presentation, kingdoms and glossary from data/glossaire.json.
// Everything is built with textContent: content is never parsed as HTML.

const GENERAL = 'general';

const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const slugify = (value) => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
}

function renderPresentation(data) {
    const p = data.presentation || {};
    const set = (id, value) => {
        const node = document.getElementById(id);
        if (!node) return;
        node.textContent = value || '';
        node.hidden = !value;
    };
    set('homeKicker', p.surtitre);
    set('homeTitle', p.titre || 'Astoria');
    set('homeTagline', p.accroche);
    set('homeText', p.texte);
}

function renderKingdoms(data, onSelect) {
    const list = document.getElementById('homeKingdoms');
    if (!list) return;
    list.innerHTML = '';
    (data.royaumes || []).forEach((kingdom) => {
        const card = el('article', 'home-kingdom');
        card.id = `royaume-${kingdom.id}`;
        if (kingdom.position) card.appendChild(el('span', 'home-kingdom-position', kingdom.position));
        card.appendChild(el('h3', 'home-kingdom-name', kingdom.nom));
        if (kingdom.accroche) card.appendChild(el('p', 'home-kingdom-tagline', kingdom.accroche));
        if (kingdom.description) card.appendChild(el('p', 'home-kingdom-text', kingdom.description));
        if (Array.isArray(kingdom.tags) && kingdom.tags.length) {
            const tags = el('div', 'home-tags');
            kingdom.tags.forEach((tag) => tags.appendChild(el('span', 'home-tag', tag)));
            card.appendChild(tags);
        }
        const btn = el('button', 'home-btn home-btn--ghost', `Termes de ${kingdom.nom}`);
        btn.type = 'button';
        btn.addEventListener('click', () => onSelect(kingdom.id));
        card.appendChild(btn);
        list.appendChild(card);
    });
}

function createGlossary(data) {
    const kingdoms = data.royaumes || [];
    const categories = data.categories || [];
    const kingdomName = (id) => (id === GENERAL ? 'Général' : kingdoms.find((k) => k.id === id)?.nom || id);
    const categoryName = (id) => categories.find((c) => c.id === id)?.libelle || id;
    const terms = (data.termes || [])
        .filter((t) => t && t.terme)
        .map((t) => ({
            ...t,
            royaume: t.royaume || GENERAL,
            slug: `terme-${slugify(t.terme)}`,
            haystack: normalize([t.terme, ...(t.alias || []), t.definition].join(' '))
        }))
        .sort((a, b) => normalize(a.terme).localeCompare(normalize(b.terme), 'fr'));

    const state = { query: '', kingdom: 'all', category: 'all' };
    const search = document.getElementById('glossarySearch');
    const kingdomChips = document.getElementById('glossaryKingdoms');
    const categoryChips = document.getElementById('glossaryCategories');
    const letters = document.getElementById('glossaryLetters');
    const results = document.getElementById('glossaryResults');
    const count = document.getElementById('glossaryCount');

    function buildChips(container, options, key) {
        container.innerHTML = '';
        options.forEach(({ value, label }) => {
            const chip = el('button', 'home-chip', label);
            chip.type = 'button';
            chip.dataset.value = value;
            chip.setAttribute('aria-pressed', String(state[key] === value));
            chip.addEventListener('click', () => {
                state[key] = value;
                container.querySelectorAll('.home-chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === value)));
                render();
            });
            container.appendChild(chip);
        });
    }

    function render() {
        const query = normalize(state.query);
        const visible = terms.filter((t) =>
            (state.kingdom === 'all' || t.royaume === state.kingdom)
            && (state.category === 'all' || t.categorie === state.category)
            && (!query || t.haystack.includes(query)));

        count.textContent = `${visible.length} terme${visible.length > 1 ? 's' : ''}`;
        results.innerHTML = '';
        letters.innerHTML = '';

        if (!visible.length) {
            results.appendChild(el('p', 'home-empty', 'Aucun terme ne correspond à cette recherche.'));
            return;
        }

        const groups = new Map();
        visible.forEach((t) => {
            const letter = normalize(t.terme).charAt(0).toUpperCase() || '#';
            if (!groups.has(letter)) groups.set(letter, []);
            groups.get(letter).push(t);
        });

        groups.forEach((items, letter) => {
            const link = el('a', 'home-letter', letter);
            link.href = `#lettre-${letter}`;
            letters.appendChild(link);

            const group = el('section', 'home-letter-group');
            group.setAttribute('aria-labelledby', `lettre-${letter}`);
            const heading = el('h3', 'home-letter-title', letter);
            heading.id = `lettre-${letter}`;
            group.appendChild(heading);
            const list = el('div', 'home-terms');
            items.forEach((t) => {
                const card = el('article', 'home-term');
                card.id = t.slug;
                const name = el('h4', 'home-term-name', t.terme);
                if (Array.isArray(t.alias) && t.alias.length) {
                    name.appendChild(el('span', 'home-term-alias', ` (${t.alias.join(', ')})`));
                }
                card.appendChild(name);
                const hasDef = Boolean(String(t.definition || '').trim());
                card.appendChild(el('p', hasDef ? 'home-term-def' : 'home-term-def home-term-def--empty', hasDef ? t.definition : 'Définition à venir.'));
                const tags = el('div', 'home-tags');
                tags.appendChild(el('span', 'home-tag', kingdomName(t.royaume)));
                if (t.categorie) tags.appendChild(el('span', 'home-tag', categoryName(t.categorie)));
                card.appendChild(tags);
                list.appendChild(card);
            });
            group.appendChild(list);
            results.appendChild(group);
        });
    }

    buildChips(kingdomChips, [
        { value: 'all', label: 'Tous les royaumes' },
        { value: GENERAL, label: 'Général' },
        ...kingdoms.map((k) => ({ value: k.id, label: k.nom }))
    ], 'kingdom');
    buildChips(categoryChips, [
        { value: 'all', label: 'Toutes les catégories' },
        ...categories.map((c) => ({ value: c.id, label: c.libelle }))
    ], 'category');

    let timer = null;
    search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            state.query = search.value;
            render();
        }, 120);
    });

    render();

    return {
        selectKingdom(id) {
            state.kingdom = id;
            kingdomChips.querySelectorAll('.home-chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === id)));
            render();
            document.getElementById('glossaire')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
}

async function initHome() {
    const status = document.getElementById('glossaryCount');
    try {
        const response = await fetch('data/glossaire.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        renderPresentation(data);
        const glossary = createGlossary(data);
        renderKingdoms(data, (id) => glossary.selectKingdom(id));
        // Deep link to a term (index.html#terme-kaels) once rendered
        if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    } catch (error) {
        console.error('[Home] content load failed:', error);
        if (status) status.textContent = 'Le contenu n\'a pas pu être chargé. Recharge la page.';
    }
}

initHome();
