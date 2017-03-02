

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
      this.dueMonth = parseMonth(dueMonth);
      this.dueYear = parseYear(dueYear);
      this.description = description;
      this.completed = false;
      this.id = id;
      return this;
    }
  };
  
  var id = localStorage.id || 0;
  var todos = getTodos() || [];
  var completedTodos = todos.filter(function(todo) {
    return todo.completed === true;
  });
  var completedTodoListsByDate = createDatedLists(completedTodos);
  var todoListsByDate = createDatedLists(todos);
  
  createDatedLists(todos);
  console.log(todoListsByDate);
  renderNav();
  renderMain();
  
  function renderNav() {
    $('.all_todos + ul').html(listsTemplate({lists: todoListsByDate}))
    $('.all_todos .count').text(todos.length);
    $('.completed + ul').html(listsTemplate({lists: completedTodoListsByDate}))
    
  }
  
  function makeDateCollection(todos) {
    var dateCollection = []
    todos.forEach(function(todo) {
      
    })
  }
  
  function renderMain() {
    $('main h1 .title').text('All Todos' + ' ');
    $('main h1 .count').text(todos.length);
    $('main ul').html(todosTemplate({todos: todos}));
  }
  
  $('.add_new').on('click', function(e) {
    e.preventDefault();
    toggleModal('new');
    addButtonEventListeners('new')
  })
  
  $('main ul').on('click', 'img', function(e) {
    e.preventDefault();
    var todoID = $(e.target).closest('li').attr('data-id');
    matchingTodoIndex = todos.findIndex(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    });
    todos.splice(matchingTodoIndex, 1);
    setTodos(todos);
    renderNav();
    renderMain();
  })
  
  // this function iterates through every todo and assigns them to arrays sorted
  // by month/year
  function createDatedLists(todos) {
    var datedLists = []
    // { date: '04/17', todos: [todo1, todo2, todo3], numTodos = this.todos.length; }
    
    todos.forEach(function(todo) {
      var stringDate = todo.dueMonth + '/' + todo.dueYear;
      
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
  
  
  
  function toggleModal(type) {
    $('#modal_toggle').click();
  }
  
  function addButtonEventListeners(type) {
    $('form').on('submit', function(e) {
      e.preventDefault();
      var input = $('form').serializeArray();
      if (type === 'new') {
        createNewTodo(input);
      }
      toggleModal();
      renderNav();
      renderMain();
    })
    $('#mark_complete').on('click', function(e) {
      e.preventDefault();
      if (type === 'new') {
        alert("Cannot mark item complete since it hasn't been created yet!")
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
  }
  
  function getTodos() {
    return JSON.parse(localStorage.getItem('todos'));
  }
  
})