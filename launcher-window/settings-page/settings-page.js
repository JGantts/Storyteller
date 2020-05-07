$('.setting-checkbox').each(function() {
  this.checked = settings.get(this.getAttribute('data-backend-name'), this.getAttribute('data-default'))
  this.addEventListener('change', (event) => {
    settings.set(event.target.getAttribute('data-backend-name'), event.target.checked);
    setStatehint(event.target);
  });
  setStatehint(this);
 });

function setStatehint(checkbox){
  let stateHintDivSelector = '#' + checkbox.id + '-statehint';
  $(stateHintDivSelector).text('(' + (
    checkbox.checked
    ? $(stateHintDivSelector).attr('data-checked-statehint')
    : $(stateHintDivSelector).attr('data-unchecked-statehint')
  ) + ')');
}
