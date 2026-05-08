document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[data-preferences-modal]');
  document.querySelector('[data-open-preferences]')?.addEventListener('click', () => {
    if (modal) modal.hidden = false;
  });
  document.querySelector('[data-close-preferences]')?.addEventListener('click', () => {
    if (modal) modal.hidden = true;
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
        }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  });
});
