(function () {
  let listArray = [],
    listName = '';

  // Заголовок(название говорит само за себя)
  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  // Форма для создания дела
  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    buttonWrapper.classList.add('input-group-append');
    button.classList.add('btn', 'btn-primary');
    button.textContent = 'Добавить дело';
    button.disabled = true;

    input.addEventListener('input', function () {
      if (input.value !== "") {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    });

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button
    };
  }

  //Создание и возврат списка элементов
  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  function createTodoItem(obj) {
    let item = document.createElement('li');
    // кнопки помещаем в элемент, который красиво покажет их в одной группе
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    //устанавливаем стили для элемента списка, а также для размещения кнопок
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.textContent = obj.name;

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    if (obj.done === true) {
      item.classList.add('list-group-item-success');
    }

    doneButton.addEventListener('click', async function () {
      item.classList.toggle('list-group-item-success');
      for (const listItem of listArray) {
        if (listItem.id == obj.id) listItem.done = !listItem.done
      }

      const response = await fetch(` http://localhost:3000/api/todos/${obj.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !obj.done }),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // saveList(listArray, listName);
    });

    deleteButton.addEventListener('click', async function () {
      if (confirm('Вы уверены?')) {
        item.remove();

        for (let i = 0; i < listArray.length; i++) {
          if (listArray[i].id == obj.id) listArray.splice(i, 1);
        }

        const response = await fetch(` http://localhost:3000/api/todos/${obj.id}`, {
          method: 'DELETE'
        })

        // saveList(listArray, listName);
      }
    });

    // вкладываем кнопки в отдельный элемент, чтобы они объеденились в один блок
    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    // приложению даём доступ к самому элементу и кнопкам, чтобы обработать события нажатия
    return item;
  }

  function generateId() {
    let id = 0;
    for (let i = 0; i < listArray.length; i++) {
      id++;
    }
    return id;
  }

  // function saveList(arr, keyName) {
  //   localStorage.setItem(keyName, JSON.stringify(arr));
  // }

  async function createTodoApp(container, title = 'Список дел', keyName) {
    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();

    listName = keyName;

    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    const response = await fetch(`http://localhost:3000/api/todos?owner=${keyName}`);
    const todoItemList = await response.json();

    todoItemList.forEach(todoItem => {
      const todoItemElement = createTodoItem(todoItem);
      todoList.append(todoItemElement);
    });

    // let localData = localStorage.getItem(listName);

    // if (localData != null && localData != '') {
    //   listArray = JSON.parse(localData);
    // }

    // for (const itemList of listArray) {
    //   let todoItem = createTodoItem(itemList);
    //   todoList.append(todoItem.item);
    // }

    //браузер создаёт событие submit на форме по нажатию на enter или на кнопку создания дела
    todoItemForm.form.addEventListener('submit', async function (e) {
      // эта строчка необходима, чтобы предотвратить стандартное действие браузера
      // в данном случае мы не хотим, чтобы страница перезагружалась после отправки формы
      e.preventDefault();

      // игнорируем создание элемента, если пользователь ничего не ввёл в поле
      if (!todoItemForm.input.value) {
        return;
      }

      let newItem = {
        id: generateId(),
        name: todoItemForm.input.value,
        done: false,
        owner: keyName
      }

      const response = await fetch(`http://localhost:3000/api/todos`, {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const todoItem = await response.json()

      let todoItemElement = createTodoItem(newItem);

      listArray.push(newItem);

      // saveList(listArray, listName);

      todoList.append(todoItemElement);
      todoItemForm.button.disabled = true;
      // обнуляем значение в поле, чтобы не пришлось стирать его вручную
      todoItemForm.input.value = '';
    });
  }

  window.createTodoApp = createTodoApp;
})();
