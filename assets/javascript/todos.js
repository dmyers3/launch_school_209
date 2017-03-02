

// todo object
//   title
//   due day
//   due month
//   due year
//   description
//   completed (bool)
//   id (auto-generated and unique)

// todos object
//   month
//   year
//   number of todos
//   has completed?
  
// Main area will be handlebars

// heading will be title, count
// link to add new todo - this pops up modal

// list of todos

// when submit new todo, create new todo object and display all todos in main
// when edit current todo, edits info and stays on same page in main

// render All Todos Lists
// render Completed Lists
// render Todo List
// create New Todo
// Delete Todo
// Edit todo








$(function() {
  var listsTemplate = Handlebars.compile($('#all_todos_lists').html());
  var todosTemplate = Handlebars.compile($('#todos').html());
    
  var todo = {
    init: function(title, dueDay, dueMonth, dueYear, description, id) {
      this.title = title;
      this.dueDay = dueDay;
      this.dueMonth = dueMonth;
      this.dueYear = dueYear;
      this.description = description;
      this.completed = 'notCompleted';
      this.id = id;
      this.numMonth = parseMonth(dueMonth);
      this.yearAbbrev = parseYear(dueYear);
      return this;
    }
  };
  
  var id = localStorage.id || 0;
  var todos = getTodos() || [];
  var completedTodos = filterCompletedTodos();
  var completedTodoListsByDate = createDatedLists(completedTodos);
  var todoListsByDate = createDatedLists(todos);
  
  createDatedLists(todos);
  renderNav();
  renderMain('All Todos', todos);
  
  function renderNav() {
    $('.all_todos + ul').html(listsTemplate({lists: todoListsByDate}))
    $('.all_todos .count').text(todos.length);
    $('.completed + ul').html(listsTemplate({lists: completedTodoListsByDate}))
    
  }
  
  function renderMain(title, todos) {
    $('main h1 .title').text(title + ' ');
    $('main h1 .count').text(todos.length);
    $('main ul').html(todosTemplate({todos: sortTodos(todos)}));
  }
  
  $('.add_new').on('click', function(e) {
    e.preventDefault();
    displayModal();
    addButtonEventListeners('new')
  })
  
  function displayModal(todo) {
    if (todo) {
      $('#title').val(todo.title);
      $('#day').val(todo.dueDay);
      $('#month').val(todo.dueMonth);
      $('#year').val(todo.dueYear);
      $('#description').val(todo.description);
    } else {
      $('#title').val('');
      $('#day').val('');
      $('#month').val('');
      $('#year').val('');
      $('#description').val('');
    }
    toggleModal();
    
  }
  
  function toggleModal() {
    $('#modal_toggle').click();
  }
  
  $('main ul').on('click', function(e) {
    e.preventDefault();
    var todoID = $(e.target).closest('li').attr('data-id');
    if (e.target.nodeName === 'SPAN') {
      displayEditModal(todoID);
    } else if (e.target.nodeName === 'LABEL') {
      if ($('.modal').is(':visible')) {
        $('#modal_toggle').click();
      } else {
        toggleTodoCompleted(todoID);
      }
    } else if (e.target.nodeName === 'A' || e.target.nodeName === 'IMG') {
      deleteTodo(todoID);
    }
  });
  
  function filterCompletedTodos() {
    return todos.filter(function(todo) {
      return todo.completed === 'completed';
    });
  }
  
  function displayEditModal(todoID) {
    var todo = todos.filter(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    })[0];
    displayModal(todo);
    addButtonEventListeners('edit', todoID);
  }
  
  function toggleTodoCompleted(todoID) {
    var todo = todos.filter(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    })[0];
    if (todo.completed === 'notCompleted') {
      todo.completed = 'completed';
    } else {
      todo.completed = 'notCompleted';
    }
    setTodos(todos);
    // var viewableTodos = currentTodos();
    renderPage(currentHeader(), currentTodos());
  }
  
  function currentHeader() {
    return $('main .title').text();
  }
  
  function currentTodos() {
    var header = currentHeader().trim();
    console.log(header);
    if (header === 'All Todos') {
      return todos;
    } else if (header === 'Completed') {
      return filterCompletedTodos();
    } else {
      if ($('all .active')) {
        return getTodosFromDateList(todoListsByDate, header);
      } else {
        return getTodosFromDateList(completedTodoListsByDate, header);
      }
    }
  }
  
  
  function sortTodos(todos) {
    return todos.sort(function(todo1, todo2) {
      if (todo1.completed === 'notCompleted' && todo2.completed === 'completed') {
        return -1;
      } else if (todo1.completed === 'completed' && todo2.completed === 'notCompleted') {
        return 1;
      } else {
        return parseInt(todo1.id) - parseInt(todo2.id);
      }
    })
  }
  
  function renderPage(title, todos) {
    renderNav();
    renderMain(title, todos);
  }
  
  function deleteTodo(todoID) {
    // removes todo from todo Array and resaves array in storage
    matchingTodoIndex = todos.findIndex(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    });
    todos.splice(matchingTodoIndex, 1);
    setTodos(todos);
    renderPage(currentHeader(), currentTodos());
  }
  
  // $('main ul').on('click', 'img', function(e) {
  //   e.preventDefault();
  //   var todoID = $(e.target).closest('li').attr('data-id');
  //   matchingTodoIndex = todos.findIndex(function(todo) {
  //     return parseInt(todo.id) === parseInt(todoID);
  //   });
  //   todos.splice(matchingTodoIndex, 1);
  //   setTodos(todos);
  //   renderNav();
  //   renderMain();
  // });
  
  // this function iterates through every todo and assigns them to arrays sorted
  // by month/year
  function createDatedLists(todos) {
    var datedLists = []
    // { date: '04/17', todos: [todo1, todo2, todo3], numTodos = this.todos.length; }
    
    todos.forEach(function(todo) {
      var stringDate = parseMonth(todo.dueMonth) + '/' + parseYear(todo.dueYear);
      
      if (todoExistsInDatedList(stringDate, datedLists)) {
        var listIndex = datedLists.findIndex(function(list) {
          return list.date === stringDate;
        });
        datedLists[listIndex].todos.push(todo);
        datedLists[listIndex].numTodos += 1;
      } else {
        var newDateObject = {}
        newDateObject[stringDate] = [todo];
        datedLists.push({ date: stringDate, todos: [todo], numTodos: 1});
      }
    });
    return datedLists;
  }
  
  // [ {'2/17' : [todo1, todo2]}, {'5/18' : [todo3, todo4]}]
  
  function todoExistsInDatedList(stringDate, datedLists) {
    return datedLists.some(function(list) {
      return list.date === stringDate;
    });
  }
  
  function parseMonth(month) {
    var monthNum = new Date(Date.parse(month +" 1, 2012")).getMonth() + 1;
    if (monthNum.length === 1) {
      monthNum = '0' + monthNum;
    }
    return monthNum;
  }
  
  function parseYear(year) {
    return year.slice(2);
  }
  
  function getTodoByID(todoID) {
    return todos.filter(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    })[0];
  }
  
  $('nav ul').on('click', 'li', function(e) {
    e.preventDefault();
    $('nav .active').removeClass('active');
    $(e.target).addClass('active');
    var date = $(e.target).text().split(' ')[0];
    
    if ($(e.target).closest('ul').attr('class') === 'all') {
      var datedTodos = getTodosFromDateList(todoListsByDate, date);
    } else {
      var datedTodos = getTodosFromDateList(completedTodoListsByDate, date);
    }
    
    renderMain(date, datedTodos);
  })
  
  $('nav h2').on('click', function(e) {
    e.preventDefault();
    $('nav .active').removeClass('active');
    $(e.target).addClass('active');
    console.log($(e.target).text().trim());
    console.log($(e.target).text().trim().length);
    if ($(e.target).text().match('All Todos')) {
      renderMain('All Todos', todos);
    } else if ($(e.target).text().match('Completed')) {
      renderMain('Completed ', completedTodos)
    }
  })
  
  function getTodosFromDateList(list, selectedDate) {
    var chosenList = list.filter(function(listElement) {
      return listElement.date.trim() === selectedDate.trim();
    })[0] || {};
    console.log(chosenList);
    return chosenList.todos || [];
  }
  
  function editTodo(input, todoID) {
    var todo = getTodoByID(todoID);
    todo.title = input[0].value;
    todo.dueDay = input[1].value;
    todo.dueMonth = input[2].value;
    todo.dueYear = input[3].value;
    todo.description = input[4].value;
    todo.numMonth = parseMonth(todo.dueMonth);
    todo.yearAbbrev = parseYear(todo.dueYear);
    setTodos(todos);
  }
 
  
  function addButtonEventListeners(type, todoID) {
    $('form').on('submit', function(e) {
      e.preventDefault();
      var input = $('form').serializeArray();
      if (type === 'new') {
        createNewTodo(input);
      } else if (type === 'edit') {
        editTodo(input, todoID);
      }
      toggleModal();
      renderPage('All Todos', todos);
    })
    $('#mark_complete').on('click', function(e) {
      e.preventDefault();
      if (type === 'new') {
        alert("Cannot mark item complete since it hasn't been created yet!")
      } else {
        toggleTodoCompleted(todoID);
        toggleModal();
      }
    })
    // turn off button listeners if modal is clicked out of
    $('#modal_toggle').on('click', function() {
      $('form').off('submit');
      $('#mark_complete').off('click');
    })
  }
  
  function assignID() {
    id = parseInt(id, 10) + 1;
    localStorage.id = id;
    return id;
  }
  
  function createNewTodo(input) {
    var title = input[0].value;
    var day = input[1].value;
    var month = input[2].value;
    var year = input[3].value;
    var description = input[4].value;
    var id = assignID();
    todos.push(Object.create(todo).init(title, day, month, year, description, id));
    setTodos(todos);
  }
  
  function setTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
    // updates todo lists - can refactor this later so that instead of recreating
    // lists from scracth you can find and remove specific todo
    completedTodos = filterCompletedTodos();
    completedTodoListsByDate = createDatedLists(completedTodos);
    todoListsByDate = createDatedLists(todos);
  }
  
  function getTodos() {
    return JSON.parse(localStorage.getItem('todos'));
  }
  
})