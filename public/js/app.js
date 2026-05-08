document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const body = document.body;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const setThemeIcon = () => {
    if (!themeToggle) return;
    themeToggle.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
  };

  setThemeIcon();
  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    localStorage.setItem('petmarket-theme', nextTheme);
    setThemeIcon();
  });


  const navToggle = document.querySelector('[data-nav-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');
  const navBackdrop = document.querySelector('[data-nav-backdrop]');

  function setNavigationOpen(isOpen) {
    if (!navToggle || !mainNav) return;
    mainNav.hidden = !isOpen;
    if (navBackdrop) navBackdrop.hidden = !isOpen;
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar barra de navegación' : 'Abrir barra de navegación');
    body.classList.toggle('nav-open', isOpen);
    if (isOpen) setTimeout(() => mainNav.querySelector('a')?.focus(), 0);
  }

  navToggle?.addEventListener('click', () => {
    setNavigationOpen(mainNav?.hidden ?? true);
  });

  mainNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavigationOpen(false));
  });
  navBackdrop?.addEventListener('click', () => setNavigationOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav && !mainNav.hidden) {
      setNavigationOpen(false);
      navToggle?.focus();
    }
  });

  const modal = document.querySelector('[data-preferences-modal]');
  const openPreferenceButtons = document.querySelectorAll('[data-open-preferences]');
  const closePreferenceButtons = document.querySelectorAll('[data-close-preferences]');
  const firstPreferenceField = modal?.querySelector('select, input, button');

  function openPreferences(event) {
    event?.preventDefault();
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    setTimeout(() => firstPreferenceField?.focus(), 0);
  }

  function closePreferences(event) {
    event?.preventDefault();
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
  }

  openPreferenceButtons.forEach((button) => button.addEventListener('click', openPreferences));
  closePreferenceButtons.forEach((button) => button.addEventListener('click', closePreferences));
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closePreferences(event);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) closePreferences(event);
  });

  const preferenceForm = document.querySelector('[data-preference-form]');
  const sizeSelect = preferenceForm?.querySelector('[data-size-select]');
  const speciesSelect = preferenceForm?.querySelector('[data-species-select]');
  const speciesHint = preferenceForm?.querySelector('[data-species-hint]');
  const foodLineSelect = preferenceForm?.querySelector('[data-food-line-select]');
  const medicalConditionSelect = preferenceForm?.querySelector('[data-medical-condition-select]');
  const foodHint = preferenceForm?.querySelector('[data-food-hint]');

  function updateFoodOptions() {
    if (!foodLineSelect || !medicalConditionSelect || !speciesSelect) return;
    const selectedSpecies = speciesSelect.value;
    const foodApplies = ['perro', 'gato'].includes(selectedSpecies);
    foodLineSelect.disabled = !foodApplies;
    if (!foodApplies) foodLineSelect.value = '';
    const medicalApplies = foodApplies && foodLineSelect.value === 'medicada';
    medicalConditionSelect.disabled = !medicalApplies;
    if (!medicalApplies) medicalConditionSelect.value = '';
    if (foodHint) {
      foodHint.textContent = foodApplies
        ? 'La línea comercial/medicada aplica solo a comida para perro o gato.'
        : 'Para aves, hamsters o peces se muestran accesorios y otros productos; la línea de comida comercial/medicada no aplica.';
    }
  }


  const speciesLabels = {
    '': 'Primero elige tamaño',
    perro: 'Perro',
    gato: 'Gato',
    ave: 'Ave',
    hamster: 'Hamster',
    pez: 'Pez',
  };
  const coherentSpecies = {
    pequeña: ['ave', 'hamster', 'pez'],
    mediano: ['perro', 'gato'],
    grande: ['perro'],
  };

  function updateSpeciesOptions() {
    if (!sizeSelect || !speciesSelect) return;
    const selectedSize = sizeSelect.value;
    const allowed = coherentSpecies[selectedSize] || [];
    const currentSpecies = speciesSelect.value;
    speciesSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = selectedSize ? 'Selecciona una mascota compatible' : 'Primero elige tamaño';
    speciesSelect.appendChild(placeholder);
    allowed.forEach((species) => {
      const option = document.createElement('option');
      option.value = species;
      option.textContent = speciesLabels[species];
      speciesSelect.appendChild(option);
    });
    speciesSelect.disabled = !selectedSize;
    speciesSelect.value = allowed.includes(currentSpecies) ? currentSpecies : '';
    if (speciesHint) {
      speciesHint.textContent = selectedSize
        ? `Opciones compatibles: ${allowed.map((species) => speciesLabels[species]).join(', ')}.`
        : 'La lista se ajusta al tamaño seleccionado.';
    }
    updateFoodOptions();
  }

  updateSpeciesOptions();
  sizeSelect?.addEventListener('change', updateSpeciesOptions);
  speciesSelect?.addEventListener('change', updateFoodOptions);
  foodLineSelect?.addEventListener('change', updateFoodOptions);
  updateFoodOptions();
  preferenceForm?.addEventListener('submit', (event) => {
    if (sizeSelect?.value && speciesSelect && !speciesSelect.value) {
      event.preventDefault();
      speciesSelect.focus();
      if (speciesHint) speciesHint.textContent = 'Selecciona una mascota compatible antes de guardar.';
    }
  });


  const accordionItems = document.querySelectorAll('[data-preference-accordion] details');
  accordionItems.forEach((item) => {
    const indicator = item.querySelector('summary span');
    const syncIndicator = () => {
      if (indicator) indicator.textContent = item.open ? '−' : '+';
    };
    syncIndicator();
    item.addEventListener('toggle', syncIndicator);
  });

  const searchForm = document.querySelector('[data-site-search]');
  const searchInput = searchForm?.querySelector('input[type="search"]');
  const productCards = Array.from(document.querySelectorAll('[data-product-card]'));
  const productSections = Array.from(document.querySelectorAll('[data-product-section]'));
  const emptySearch = document.querySelector('[data-search-empty]');

  function normalizeText(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filterProducts(query) {
    const normalizedQuery = normalizeText(query);
    let visibleCount = 0;
    productCards.forEach((card) => {
      const matches = !normalizedQuery || normalizeText(card.dataset.search).includes(normalizedQuery);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    productSections.forEach((section) => {
      const hasVisibleCards = Array.from(section.querySelectorAll('[data-product-card]')).some((card) => !card.hidden);
      section.hidden = Boolean(normalizedQuery) && !hasVisibleCards;
    });
    if (emptySearch) emptySearch.hidden = !normalizedQuery || visibleCount > 0;
  }

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    filterProducts(searchInput?.value || '');
    document.querySelector('#tienda')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  searchInput?.addEventListener('input', () => filterProducts(searchInput.value));

  document.querySelectorAll('canvas[data-labels]').forEach((canvas, index) => {
    if (!window.Chart) return;
    const labels = JSON.parse(canvas.dataset.labels || '[]');
    const values = JSON.parse(canvas.dataset.values || '[]');
    new Chart(canvas, {
      type: index === 0 ? 'bar' : 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Analítica',
          data: values,
          backgroundColor: ['#ff7a59', '#2fbf71', '#3b82f6', '#f59e0b', '#8b5cf6'],
          borderColor: 'rgba(255,255,255,.9)',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  });
});
