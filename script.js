function setupAccordion() {
  const items = document.querySelectorAll('.acc-item');

  items.forEach(function (item) {
    const button = item.querySelector('.acc-title');
    const body = item.querySelector('.acc-body');
    const icon = button && button.querySelector('span');

    if (!button || !body) return;
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', function () {
      const shouldOpen = !item.classList.contains('open');

      items.forEach(function (otherItem) {
        otherItem.classList.remove('open');
        const otherButton = otherItem.querySelector('.acc-title');
        const otherBody = otherItem.querySelector('.acc-body');
        const otherIcon = otherButton && otherButton.querySelector('span');

        if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        if (otherBody) otherBody.style.maxHeight = '';
        if (otherIcon) otherIcon.textContent = '+';
      });

      if (shouldOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        button.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '-';
      }
    });
  });
}

function setupTripForm() {
  const form = document.getElementById('tripForm');
  const destination = document.getElementById('destination');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const message = document.getElementById('tripMessage');

  if (!form || !destination || !startDate || !endDate || !message) return;

  form.noValidate = true;
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.setAttribute('aria-atomic', 'true');

  function formatLocalDate(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00.000Z');
    return !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;
  }

  const today = formatLocalDate(new Date());
  startDate.min = today;
  endDate.min = today;

  function showMessage(text, isError) {
    message.textContent = text;
    message.style.color = isError ? '#b00020' : '#1a3c34';
  }

  function clearInvalidState() {
    [destination, startDate, endDate].forEach(function (field) {
      field.removeAttribute('aria-invalid');
    });
    showMessage('', false);
  }

  startDate.addEventListener('change', function () {
    endDate.min = startDate.value || today;
  });

  form.addEventListener('input', clearInvalidState);
  form.addEventListener('change', clearInvalidState);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearInvalidState();

    const errors = [];
    let firstInvalidField = null;

    function addError(field, text) {
      field.setAttribute('aria-invalid', 'true');
      if (!firstInvalidField) firstInvalidField = field;
      errors.push(text);
    }

    const destinationIsValid = Array.from(destination.options).some(function (option) {
      return option.value === destination.value && option.value !== '' && !option.disabled;
    });

    if (!destinationIsValid) {
      addError(destination, 'Please select a destination from the list.');
    }

    if (!startDate.value) {
      addError(startDate, 'Please choose a start date.');
    } else if (!isValidDate(startDate.value)) {
      addError(startDate, 'Please enter a valid start date.');
    } else if (startDate.value < today) {
      addError(startDate, 'The start date cannot be in the past.');
    }

    if (!endDate.value) {
      addError(endDate, 'Please choose an end date.');
    } else if (!isValidDate(endDate.value)) {
      addError(endDate, 'Please enter a valid end date.');
    } else if (endDate.value < today) {
      addError(endDate, 'The end date cannot be in the past.');
    } else if (startDate.value && isValidDate(startDate.value) &&
      endDate.value < startDate.value) {
      addError(endDate, 'The end date must be on or after the start date.');
    }

    if (errors.length > 0) {
      showMessage(errors.join(' '), true);
      firstInvalidField.focus();
      return;
    }

    const experiences = Array.from(
      form.querySelectorAll('input[name="exp"]:checked')
    ).map(function (checkbox) { return checkbox.value; });
    const params = new URLSearchParams({
      place: destination.value,
      start: startDate.value,
      end: endDate.value,
      exp: experiences.join(',')
    });
    window.location.href = 'place.html?' + params.toString();
  });
}

function setupPopularPlaces() {
  const places = document.querySelector('#places .card-grid');
  if (!places) return;

  places.addEventListener('click', function (event) {
    const button = event.target instanceof Element && event.target.closest('.place-card button');
    const name = button && button.closest('.place-card').querySelector('h3');
    if (name) window.location.href = 'place.html?place=' + encodeURIComponent(name.textContent);
  });
}

setupAccordion();
setupTripForm();
setupPopularPlaces();
