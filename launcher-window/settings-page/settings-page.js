$('.setting-checkbox').each(function() {
  this.checked = settings.get(this.getAttribute('data-backend-name'), this.getAttribute('data-default'))
  this.addEventListener('change', (event) => {
    settings.set(event.target.getAttribute('data-backend-name'), event.target.checked);
  });
 });
