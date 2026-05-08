document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
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

  const modal = document.querySelector('[data-preferences-modal]');
  document.querySelector('[data-open-preferences]')?.addEventListener('click', () => {
    if (modal) modal.hidden = false;
  });
  document.querySelectorAll('[data-close-preferences]').forEach((button) => {
    button.addEventListener('click', () => {
      if (modal) modal.hidden = true;
    });
  });
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.hidden = true;
  });

  const preferenceForm = document.querySelector('[data-preference-form]');
  const sizeSelect = preferenceForm?.querySelector('[data-size-select]');
  const speciesSelect = preferenceForm?.querySelector('[data-species-select]');
  const speciesHint = preferenceForm?.querySelector('[data-species-hint]');
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
  }

  updateSpeciesOptions();
  sizeSelect?.addEventListener('change', updateSpeciesOptions);

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
