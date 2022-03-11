document.addEventListener('DOMContentLoaded', function() {
  const elements = document.getElementsByName('contacts__select');
  elements.forEach(element => {
    const choices = new Choices(element, {
      searchEnabled: false,
      itemSelectText: '',
      shouldSort: false,
    });
  })
})
