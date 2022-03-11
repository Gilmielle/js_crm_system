document.addEventListener('DOMContentLoaded', async () => {
  // classList - классы необходимо задавать через массив,
  // attribute - атрибуты через объект,
  // где ключ - это название атрибута, а значение - значение атрибута
  function createElement(tag, options, parent = null) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(options)) {
      if (key === 'classList') {
        for (let i = 0; i < value.length; i++) {
          el.classList.add(value[i]);
        }
      } else if (key === 'attribute') {
        for (const [prop, propVal] of Object.entries(value)) {
          el.setAttribute(prop, propVal);
        }
      } else {
        el[key] = value;
      }
    }

    if(parent !== null) {
      parent.append(el);
    }

    return el;
  }

  async function getData(link) {
    const response = await fetch(link);
    const data = await response.json();
    return data;
  };

  async function createPage(link) {
    let clients = await sortByID(link)
    createClientTable(clients);
    addTableListeners(link);
    const modal = document.querySelector('.clients__modal');
    addModalListeners(modal, link);
    createAddStudentBtn(modal);
    searchClients(link);
    addDelBtnListener(modal, link);
  };

  function createClientTable(clients) {
    const table = document.querySelector('.table');
    const tbody = document.querySelector('tbody');
    if(tbody !== null) {
      table.removeChild(tbody);
    }

    const tableBody = createElement('tbody', {
      classList: ['table__body'],
    }, table);

    clients.forEach(client => {
      const tableRow = createElement('tr', {
        classList: ['table__row'],
      }, tableBody);

      const idCell = createElement('td', {
        classList: ['table__cell'],
        textContent: client.id,
      }, tableRow);


      const nameCell = createElement('td', {
        classList: ['table__cell'],
        textContent: getFullName(client),
      }, tableRow);


      const createdTime = getDateAndTime(client.createdAt);

      const creationCell = createElement('td', {
        classList: ['table__cell'],
      }, tableRow);

      const creationDate = createElement('time', {
        classList: ['table__date'],
        textContent: createdTime.dateFormatted,
        attribute: {
          datetime: client.createdAt,
        }
      }, creationCell);

      const creationTime = createElement('span', {
        classList: ['table__time'],
        textContent: createdTime.timeFormatted,
      }, creationCell);


      const updatedTime = getDateAndTime(client.updatedAt);

      const updateCell = createElement('td', {
        classList: ['table__cell'],
      }, tableRow);

      const updateDate = createElement('time', {
        classList: ['table__date'],
        textContent: updatedTime.dateFormatted,
        attribute: {
          datetime: client.updatedAt,
        }
      }, updateCell);

      const updateTime = createElement('span', {
        classList: ['table__time'],
        textContent: updatedTime.timeFormatted,
      }, updateCell);


      const contactsCell = createElement('td', {
        classList: ['table__cell'],
      }, tableRow);

      const contactButtonsList = createElement('ul', {
        classList: ['contacts-list']
      }, contactsCell)
      const contactButtons = createContactButtons(client.contacts, contactButtonsList);


      const actionsCell = createElement('td', {
        classList: ['table__cell'],
      }, tableRow);

      const actionButtons = createActionButtons(actionsCell, client.id);
    });
    console.log(clients)
  };

  function getFullName(client) {
    return String(client.surname + ' ' + client.name + ' ' + client.lastName);
  };

  function getDateAndTime(client) {
    let [date, time] = client.split('T');
    let [year, month, day] = date.split('-');
    let [hours, minutes, rest] = time.split(':');

    let dateFormatted = day + '.' + month + '.' + year;
    let timeFormatted = hours + ':' + minutes;
    let dateTimeFormatted = year + '.' + month + '.' + day + ' ' + hours + ':' + minutes;

    return {
      dateFormatted,
      timeFormatted,
      dateTimeFormatted
    }
  };

  function createContactButtons(contacts, parent) {
    for(let i = 0; i < contacts.length; i++) {
      const contactWrapper = createElement('li', {
        classList: ['contacts-list__item', 'tulltip']
      }, parent);

      const icon = createElement('div', {
        classList: ['tulltip__icon'],
      }, contactWrapper)

      if (contacts[i].type === 'VK') {
        icon.classList.add('tulltip__icon_vk');
      } else if (contacts[i].type === 'Facebook') {
        icon.classList.add('tulltip__icon_fb');
      } else if (contacts[i].type === 'Телефон') {
        icon.classList.add('tulltip__icon_tel');
      } else if (contacts[i].type === 'Email') {
        icon.classList.add('tulltip__icon_mail');
      } else {
        icon.classList.add('tulltip__icon_other');
      }

      const popup = createContactsPopup(contacts[i]);
      contactWrapper.append(popup);

      if(i > 3) {
        contactWrapper.classList.add('contacts-list__item_hidden');
      }
    };
    if(contacts.length > 4) {
      createMoreContactsBtn(parent, contacts.length - 4);
    }
  };

  function createContactsPopup(contact) {
    const popup = createElement('span', {
      classList: ['tulltip__popup'],
      textContent: contact.type + ': ',
    });
    
    if (contact.type !== 'Other') {
      const popup = createElement('span', {
        classList: ['tulltip__popup'],
        textContent: contact.type + ': ',
      });

      const popupValue = createElement('a', {
        classList: ['tulltip__popup-value'],
        textContent: contact.value,
        href: contact.value,
      }, popup);
  
      if (contact.type === 'Телефон') {
        popupValue.href = 'tel:' + contact.value;
        popupValue.style.color = 'white';
        popupValue.style.textDecoration = 'none';
      }
  
      if (contact.type === 'Email') {
        popupValue.href = 'mailto:' + contact.value;
      }

      return popup;
    } else {
      const [type, value] = contact.value.split(':');

      const popup = createElement('span', {
        classList: ['tulltip__popup'],
        textContent: type + ': ',
      });

      const popupValue = createElement('a', {
        classList: ['tulltip__popup-value'],
        textContent: value.trim(),
        href: value.trim(),
      }, popup);

      return popup;
    }
  };

  function createMoreContactsBtn(parent, contactsQuantity) {
    const hiddenElements = parent.querySelectorAll('.contacts-list__item_hidden');
    const moreContactsBtn = createElement('li', {
      classList: ['contacts-list__item', 'more-contacts-btn'],
      textContent: '+' + contactsQuantity,

    });
    parent.insertBefore(moreContactsBtn, hiddenElements[0])

    moreContactsBtn.addEventListener('click', () => {
      moreContactsBtn.style.display = 'none';
      hiddenElements.forEach(hiddenElement => {
        hiddenElement.classList.remove('contacts-list__item_hidden')
      })
    })
  };

  function createActionButtons(parent, id) {
    const modal = document.querySelector('.clients__modal');
    const modalAddChange = document.querySelector('.modal__add-change-client');
    const modalDel = document.querySelector('.modal__del-client');

    const changeBtn = createElement('button', {
      classList: ['btn', 'change-btn'],
      attribute: {
        type: 'button',
      },
    }, parent);

    const changeBtnSvg = createSvg('0 0 16 16 ', 16, 16, '#9873FF', 'M0 10.5V13H2.5L9.87333 5.62662L7.37333 3.12662L0 10.5ZM11.8067 3.69329C12.0667 3.43329 12.0667 3.01329 11.8067 2.75329L10.2467 1.19329C9.98667 0.933291 9.56667 0.933291 9.30667 1.19329L8.08667 2.41329L10.5867 4.91329L11.8067 3.69329Z')
    changeBtnSvg.classList.add('change-btn__icon')
    changeBtn.append(changeBtnSvg);

    const changeBtnSpan = createElement('span', {
      classList: ['change-btn__text'],
      textContent: 'Изменить',
    }, changeBtn);

    changeBtn.addEventListener('click', async function() {
      modal.classList.add('modal_active');
      modalAddChange.classList.remove('modal__add-change-client_inactive');
      modalDel.classList.add('del-client_inactive');
      modalAddChange.dataset.target = id;
      await fillForm(modal, id);
    });
    
    const deleteBtn = createElement('button', {
      classList: ['btn', 'delete-btn'],
      attribute: {
        type: 'button',
      },
    }, parent);

    const deleteBtnSvg = createSvg('0 0 16 16 ', 16, 16, '#F06A4D', 'M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z');
    deleteBtnSvg.classList.add('delete-btn__icon')
    deleteBtn.append(deleteBtnSvg);

    const deleteBtnSpan = createElement('span', {
      classList: ['delete-btn__text'],
      textContent: 'Удалить',
    }, deleteBtn);

    deleteBtn.addEventListener('click', function() {
      modal.classList.add('modal_active');
      modalAddChange.classList.add('modal__add-change-client_inactive');
      modalDel.classList.remove('del-client_inactive');
      modalDel.dataset.target = id;
    });
  };

  function addDelBtnListener(modal, link) {
    const delBtn = modal.querySelector('.del-client__submit-btn');
    delBtn.addEventListener('click', async function(evt) {
      evt.preventDefault();
      const id = modal.querySelector('.modal__del-client').dataset.target;
      const delLink = link + '/' + id;
      await fetch(delLink, {
        method: 'DELETE',
      });
      modal.classList.remove('modal_active')
      const newArray = await getData(link);
      updateTable(newArray);
    });
  };

  async function fillForm(modal, id) {
    const link = 'http://localhost:3000/api/clients';
    const clientLink = link + '/' + id;
    const client = await getData(clientLink)
    const title = modal.querySelector('.modal__title');
    const clientIDField = modal.querySelector('.modal__client-id');
    const labels = document.querySelectorAll('.client-form__label');
    const surnameField = document.getElementById('client-form-surname');
    const nameField = document.getElementById('client-form-name');
    const lastnameField = document.getElementById('client-form-lastname');
    const saveBtn = modal.querySelector('.client-form__submit-btn');
    

    title.textContent = 'Изменить данные';
    clientIDField.textContent = 'ID: ' + client.id;
    surnameField.value = client.surname;
    nameField.value = client.name;
    lastnameField.value = client.lastName;
    labels.forEach(label => {
      label.classList.add('client-form__label_active');
    });

    const contacts = client.contacts;
    for(let i = 0; i < contacts.length; i++) {
      createAddContactField(modal);
      const contactListItems = document.querySelectorAll('.contacts__item');
      const selectedTypeField = contactListItems[i].querySelector('.choices__item--selectable');
      selectedTypeField.dataset.value = contacts[i].type;
      if (contacts[i].type !== 'Other') {
        selectedTypeField.textContent = contacts[i].type;
      } else {
        selectedTypeField.textContent = 'Другое';
      }
      const selectedValueField = contactListItems[i].querySelector('.contacts__input');
      selectedValueField.value = contacts[i].value;
      const delContactBtn = contactListItems[i].querySelector('.contacts__delete-btn');
      delContactBtn.style.display = 'flex';
    };

    saveBtn.classList.add('change-client-btn');

    const modalAbortBtn = modal.querySelector('.client-form__abort-btn');
    modalAbortBtn.classList.add('client-form__abort-btn_inactive');
    const modalDelBtn = modal.querySelector('.client-form__del-btn')
    modalDelBtn.classList.remove('client-form__del-btn_inactive');

  };

   function addTableListeners(link) {
    const filterSpans = document.querySelectorAll('.table-filter__text');
    const filterIcons = document.querySelectorAll('.table-filter__icon')
    let idCounter = 1;
    let nameCounter = 0;
    let changeCounter = 0;
    let updateCounter = 0;

    document.getElementById('client-id').addEventListener('click', async () => {
      changeSortIndicators(filterSpans, filterIcons, 'client-id', idCounter);
      nameCounter = 0;
      changeCounter = 0;
      updateCounter = 0;

      let newArray = await sortByID(link);
      if(idCounter === 0) {
        idCounter++;
      } else {
        newArray.reverse();
        idCounter--;
      }

      updateTable(newArray);
    });

    document.getElementById('client-fullname').addEventListener('click', async () => {
      changeSortIndicators(filterSpans, filterIcons, 'client-fullname', nameCounter);
      idCounter = 0;
      changeCounter = 0;
      updateCounter = 0;

      let newArray = await sortByFullName(link);
      if(nameCounter === 0) {
        nameCounter++;
      } else {
        newArray.reverse();
        nameCounter--;
      }

      updateTable(newArray);
    });

    document.getElementById('client-add-datetime').addEventListener('click', async () => {
      changeSortIndicators(filterSpans, filterIcons, 'client-add-datetime', changeCounter);
      idCounter = 0;
      nameCounter = 0;
      updateCounter = 0;

      let newArray = await sortByAddDatetime(link);
      if(changeCounter === 0) {
        changeCounter++;
      } else {
        newArray.reverse();
        changeCounter--;
      }

      updateTable(newArray);
    });

    document.getElementById('client-change-datetime').addEventListener('click', async () => {
      changeSortIndicators(filterSpans, filterIcons, 'client-change-datetime', updateCounter);
      idCounter = 0;
      nameCounter = 0;
      changeCounter = 0;

      let newArray = await sortByChangeDatetime(link);
      if(updateCounter === 0) {
        updateCounter++;
      } else {
        newArray.reverse();
        updateCounter--;
      }

      updateTable(newArray);
    });
  };

  async function sortByID(link) {
    const clients = await getData(link);
    let newArray = clients
      .slice()
      .sort(function(first, second) {
        if (Number(first.id) < Number(second.id)) {
          return -1;
        }
        if (Number(first.id) > Number(second.id)) {
          return 1;
        }
        return 0;
      })
    return newArray;
  };

  async function sortByFullName(link) {
    const clients = await getData(link);
    let newArray = clients
      .slice()
      .sort(function(first, second) {
        let firstElement = getFullName(first);
        let secondElement = getFullName(second);
        if (firstElement < secondElement) {
          return -1;
        }
        if (firstElement > secondElement) {
          return 1;
        }
        return 0;
      });
    return newArray;
  };

  async function sortByAddDatetime(link) {
    const clients = await getData(link);
    let newArray = clients
      .slice()
      .sort((first, second) => sortByDate(first.createdAt, second.createdAt));
    return newArray;
  };

  async function sortByChangeDatetime(link) {
    const clients = await getData(link);
    let newArray = clients
      .slice()
      .sort((first, second) => sortByDate(first.updatedAt, second.updatedAt));
    return newArray;
  };

  function sortByDate(first, second) {
    const firstElement = getDateAndTime(first);
    const secondElement = getDateAndTime(second);
    
    const firstLine = firstElement.dateTimeFormatted;
    const secondLine = secondElement.dateTimeFormatted;
    if (firstLine < secondLine) {
      return -1;
    }
    if (firstLine > secondLine) {
      return 1;
    }
    return 0;
  };

  function changeSortIndicators(filters, icons, id, counter) {
    filters.forEach(el => {
      el.classList.remove('table-filter__text_active');
    });
    icons.forEach(el => {
      el.classList.remove('table-filter__icon_ascending');
    });

    const targetSpan = document.getElementById(id).querySelector('.table-filter__text');
    targetSpan.classList.add('table-filter__text_active');
    const targetIcon = document.getElementById(id).querySelector('.table-filter__icon');

    if(counter === 0) {
      targetIcon.classList.add('table-filter__icon_ascending');
    } else {
      targetIcon.classList.remove('table-filter__icon_ascending');
    }
  };

  function updateTable(array) {
    const tableBody = document.querySelector('.table__body');
    const table = document.querySelector('.table');
    table.removeChild(tableBody);
    createClientTable(array);
  };

  function createSvg(viewBox, width, height, fillColor, pathD) {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns, 'svg');
    svg.setAttributeNS(null, 'viewBox', viewBox);
    svg.setAttributeNS(null, 'width', width);
    svg.setAttributeNS(null, 'height', height);
    svg.setAttributeNS(null, 'fill', 'none');

    const path = document.createElementNS(xmlns, 'path');  
    path.setAttribute('d', pathD);   
    path.setAttribute('fill', fillColor); 
    svg.append(path);

    return svg;
  };

  function createAddStudentBtn(modal) {
    const container = document.querySelector('.clients__container');
    const modalAddChange = document.querySelector('.modal__add-change-client');
    const modalDel = document.querySelector('.modal__del-client');

    const addStudentBtn = createElement('button', {
      textContent: 'Добавить клиента',
      classList: ['clients__add-student-btn', 'btn', 'add-student-btn']
    }, container);

    const btnIcon = createSvg('0 0 23 16', 23, 16, '#9873FF', 'M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z');
    btnIcon.classList.add('add-student-btn__icon');
    addStudentBtn.prepend(btnIcon);

    addStudentBtn.addEventListener('click', () => {
      modal.classList.add('modal_active');
      modalAddChange.classList.remove('modal__add-change-client_inactive');
      modalDel.classList.add('del-client_inactive');
    });
  };

  function searchClients(link) {
    const search = document.getElementById('search-form__input');
    let timeoutID;

    search.addEventListener('input', async function(evt) {
      let value = evt.target.value.toLowerCase();
      clearTimeout(timeoutID);
      const clients = await getData(link);
      timeoutID = setTimeout(findClients(clients, value), 300);
    });
  };

  function findClients(array, value) {
    let foundClients = array
      .slice()
      .filter(el => {
        const includesID = el.id.includes(value);
        const includesName = getFullName(el).toLowerCase().includes(value);
        const includesContact = el.contacts.some((contact) => {
          return contact.value.includes(value);
        })
        return includesID || includesName || includesContact;
      });
    updateTable(foundClients);
  };
  
  function addModalListeners(modal, link) {
    const saveBtn = modal.querySelector('.client-form__submit-btn');
    const modalDelBtn = modal.querySelector('.client-form__del-btn')
    
    // закрытие модала и возвращение его компонентов в исходное состояние
    document.addEventListener('click', function(evt) {
      closeModal(evt, modal);
    });
    // плавный сдвиг лейблов
    const inputs = document.querySelectorAll('.client-form__input');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function(evt) {
        const targetID = evt.target.id;
        const label = document.querySelector(`[for=${targetID}]`);
        label.classList.add('client-form__label_active');
      });

      input.addEventListener('focusout', function(evt) {
        if(input.value.trim().length <= 0) {
          const targetID = evt.target.id;
          const label = document.querySelector(`[for=${targetID}]`);
          label.classList.remove('client-form__label_active');
        }
      });
    });

    // кнопка добавить контакт
    const addContactBtn = modal.querySelector('.client-form__contacts-btn');
    addContactBtn.addEventListener('click', () => {
      const contacts = modal.querySelectorAll('.contacts__item');
      createAddContactField(modal);
      if (contacts.length < 9) {
        addContactBtn.style.display = 'flex';
      } else {
        addContactBtn.style.display = 'none';
      };

      // отображение и скрытие кнопки удалить контакт
      const inputs = modal.querySelectorAll('.contacts__input');
      inputs.forEach(input => {
        input.addEventListener('change', function() {
          const parent = input.parentNode;
          const delBtn = parent.querySelector('.contacts__delete-btn');
          if(input.value.trim().length > 0) {
            delBtn.classList.add('contacts__delete-btn_active');
          } else {
            delBtn.classList.remove('contacts__delete-btn_active');
          };
        });
      });
    });

    // кнопка удалить клиента 
    modalDelBtn.addEventListener('click', async function(evt) {
        evt.preventDefault();
        const id = modal.querySelector('.modal__add-change-client').dataset.target;
        const delLink = link + '/' + id;
        await fetch(delLink, {
          method: 'DELETE',
        });
        modal.classList.remove('modal_active');
        closeModal(evt, modal);
        const newArray = await getData(link);
        updateTable(newArray);
    });

    // сохранение данных формы и обновление таблицы
    saveBtn.addEventListener('click', async function(evt) {
      evt.preventDefault();
      const form = evt.target.parentNode;
      const client = formValidator(form);
      if(client !== undefined) {
        let response;
        if(evt.target.classList.contains('change-client-btn')) {
          response = await changeClient(client, link);
        } else {
          response = await pushNewClient(client, link);
        }
        if(response.status === 200 || response.status === 201) {
          clearForm(form);
          const newArray = await getData(link);
          updateTable(newArray);
        } else {
          let errorText;
          if(response.statusText) {
            errorText = 'Ошибка: ' + response.statusText;
          } else {
            errorText = 'Что-то пошло не так...';
          }
          const error = makeError(errorText, evt.target, form);
          error.classList.add('invalid-feedback_server')
        };
      };
    });
  };

  function closeModal(evt, modal) {
    const form = modal.querySelector('.client-form');
    const modalAddChange = document.querySelector('.modal__add-change-client');
    const modalDel = document.querySelector('.modal__del-client');
    const title = modal.querySelector('.modal__title');
    const clientIDField = document.querySelector('.modal__client-id');
    const labels = document.querySelectorAll('.client-form__label');
    const saveBtn = modal.querySelector('.client-form__submit-btn');

    const modalCloseBtn = modal.querySelector('.modal__close-btn');
    const modalAbortBtn = modal.querySelector('.client-form__abort-btn');
    const modalDelBtn = modal.querySelector('.client-form__del-btn')
    const modalDelAboortBtn = modal.querySelector('.del-client__abort-btn');

    
    if (evt.target.classList.contains('modal__cell') || evt.target === modalCloseBtn || evt.target === modalAbortBtn || evt.target === modalDelAboortBtn) {
      modalAddChange.dataset.target = '';
      modalDel.dataset.target = '';
      title.textContent = 'Новый клиент';
      clientIDField.textContent = '';
      labels.forEach(label => {
        label.classList.remove('client-form__label_active');
      });
      modal.classList.remove('modal_active');
      saveBtn.classList.remove('change-client-btn');
      modalAbortBtn.classList.remove('client-form__abort-btn_inactive');
      modalDelBtn.classList.add('client-form__del-btn_inactive');
      const errors = document.querySelectorAll('.invalid-feedback');
      errors.forEach(error => {
        error.remove();
      });
      clearForm(form);
    };
  };

  function createAddContactField(modal) {
    const contactsWrapper = modal.querySelector('.client-form__contacts');
    contactsWrapper.classList.add('client-form__contacts_active')
    const contactsList = modal.querySelector('.contacts');
    contactsList.classList.add('contacts_active');

    const contactWrapper = createElement('li', {
      classList: ['contacts__item'],
    }, contactsList);

    createSelect(contactWrapper);

    const input = createElement('input', {
      classList: ['contacts__input'],
      attribute: {
        placeholder: 'Введите данные контакта',
      }
    }, contactWrapper);

    const contactDelBtn = createElement('button', {
      classList: ['contacts__delete-btn', 'tulltip'],
    }, contactWrapper);

    const delBtnIcon = createSvg('0 0 12 12', 12, 12, '#B0B0B0', 'M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z');
    delBtnIcon.classList.add('contacts__delete-icon');
    contactDelBtn.append(delBtnIcon);

    const delBtnPopup = createElement('span', {
      classList: ['contacts__popup', 'tulltip__popup'],
      textContent: 'Удалить контакт',
    }, contactDelBtn);

    contactDelBtn.addEventListener('click', () => {
      contactWrapper.remove();
      const contactWrappers = document.querySelectorAll('.contacts__item');
      if (contactWrappers.length === 0) {
        contactsWrapper.classList.remove('client-form__contacts_active')
        contactsList.classList.remove('contacts_active');
      };
      if (contactWrappers.length <= 9) {
        const addContactBtn = document.querySelector('.client-form__contacts-btn');
        addContactBtn.style.display = 'flex';
      }
    })

    refreshSelectStyles();

    return contactWrapper;
  };

  function createSelect(contactWrapper) {
    const contactSelect = createElement('select', {
      classList: ['contacts__select'],
      attribute: {
        name: 'contacts__select',
      },
    }, contactWrapper);

    const optionTel = createElement('option', {
      classList: ['contacts__select-option'],
      textContent: 'Телефон',
      attribute: {
        value: 'Телефон',
      }
    }, contactSelect);
    
    const optionEmail = createElement('option', {
      classList: ['contacts__select-option'],
      textContent: 'Email',
      attribute: {
        value: 'Email',
      }
    }, contactSelect);

    const optionFacebook = createElement('option', {
      classList: ['contacts__select-option'],
      textContent: 'Facebook',
      attribute: {
        value: 'Facebook',
      }
    }, contactSelect);

    const optionVK = createElement('option', {
      classList: ['contacts__select-option'],
      textContent: 'VK',
      attribute: {
        value: 'VK',
      }
    }, contactSelect);

    const optionOther = createElement('option', {
      classList: ['contacts__select-option'],
      textContent: 'Другое',
      attribute: {
        value: 'Other',
      }
    }, contactSelect);
  };

  function refreshSelectStyles() {
    const elements = document.getElementsByName('contacts__select');
    elements.forEach(element => {
      const choices = new Choices(element, {
        searchEnabled: false,
        itemSelectText: '',
        shouldSort: false,
      });
    });
  };

  function formValidator(form) {
    const errors = document.querySelectorAll('.invalid-feedback');
    errors.forEach(error => {
      error.remove();
    });

    let client = {};

    const surnameField = document.getElementById('client-form-surname');
    const surname = surnameField.value.trim();

    if(surname.length === 0) {
      makeError('Поле обязательно для заполнения', surnameField, form);
    } else {
      client.surname = surname;
    };

    const nameField = document.getElementById('client-form-name');
    const name = nameField.value.trim();

    if(name.length === 0) {
      makeError('Поле обязательно для заполнения', nameField, form);
    } else {
      client.name = name;
    };
    
    const lastName = document.getElementById('client-form-lastname').value.trim();
    if(lastName.length > 0) {
      client.lastName = lastName;
    }

    client.contacts = [];
    const contactListItems = document.querySelectorAll('.contacts__item');
    if(contactListItems.length > 0) {
      contactListItems.forEach(item => {
        const selectedType = item.querySelector('.choices__item--selectable').dataset.value;
        const selectedValueField = item.querySelector('.contacts__input');
        const selectedValue = selectedValueField.value.trim();
        if(selectedValue.length === 0) {
          const error = makeError('Заполните информацию либо удалите поле', selectedValueField, selectedValueField.parentNode);
          error.classList.add('invalid-feedback_select');
        } else if(selectedValue.length > 0) {
          client.contacts.push({
            'type': selectedType,
            'value': selectedValue,
          });
        };
      });
    };

    if(client.name !== undefined && client.surname !== undefined && contactListItems.length === client.contacts.length) {
      return client;
    }
  };

  function makeError(text, child, parent) {
    let error = createElement('span', {
      textContent: text,
      classList: ['invalid-feedback'],
    });
    parent.insertBefore(error, child);

    return error;
  };

  function clearForm(form) {
    const inputs = form.querySelectorAll('.client-form__input');
    inputs.forEach(input => {
      input.value = '';
    });

    const contacts = form.querySelectorAll('.contacts__item');
    contacts.forEach(contact => {
      contact.remove();
    });

    const contactsWrapper = form.querySelector('.client-form__contacts');
    contactsWrapper.classList.remove('client-form__contacts_active');

    const contactsList = form.querySelector('.contacts');
    contactsList.classList.remove('contacts_active');

    const modal = document.querySelector('.modal');
    modal.classList.remove('modal_active');
  };

  function constructDateString(time) {
    const year = time.getUTCFullYear();
    const month = getMonth(time.getMonth());
    const day = getBidigitate(time.getDate());
    const hours = time.getHours();
    const minutes = getBidigitate(time.getMinutes());
    const seconds = getBidigitate(time.getSeconds());

    return String(year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds);
  };

  function getMonth(month) {
    if (month < 9) {
      month = '0' + (month + 1);
    } else {
      month = month + 1;
    }
    return month;
  };

  function getBidigitate(number) {
    if (number < 10) {
      number = '0' + number;
    } 
    return number;
  };

  async function pushNewClient(client, link) {
    const now = new Date();
    const createdAt = constructDateString(now);
    client.createdAt = createdAt;
    client.updatedAt = createdAt;

    const createdClient = await fetch(link, {
      method: 'POST',
      body: JSON.stringify(client),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return createdClient;
  };

  async function changeClient(client, link) {
    const id = document.querySelector('.modal__add-change-client').dataset.target;
    const clientLink = link + '/' + id;
    const now = new Date();
    const updatedAt = constructDateString(now);
    client.updatedAt = updatedAt;

    const updatedClient = await fetch(clientLink, {
      method: 'PATCH',
      body: JSON.stringify(client),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return updatedClient;
  };

  await createPage('http://localhost:3000/api/clients');
})