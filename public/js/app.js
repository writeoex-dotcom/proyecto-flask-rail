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
  document.querySelector('[data-close-preferences]')?.addEventListener('click', () => {
    if (modal) modal.hidden = true;
  });
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.hidden = true;
  });

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
