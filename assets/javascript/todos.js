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
      this.formattedDueDate = formatDueDate(dueMonth, dueYear);
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
  console.log(todos);
  
  function formatDueDate(month, year) {
    if (month === null || year === null) {
      return "No Due Date";
    } else {
      return parseMonth(month) + '/' + parseYear(year);
    }
  }
  
  function renderNav() {
    $('.all_todos + ul').html(listsTemplate({lists: sortByDate(todoListsByDate)}))
    $('.all_todos .count').text(todos.length);
    $('.completed + ul').html(listsTemplate({lists: sortByDate(completedTodoListsByDate)}))
    $('h2.completed .count').text(completedTodos.length);
    $('ul.completed li').addClass('completed');
  }
  
  function sortByDate(dateArray) {
    return dateArray.sort(function(list1, list2) {
      var list1Year = parseInt(list1.date.slice(3));
      var list2Year = parseInt(list2.date.slice(3));
      if (list1.date.match("No Due Date")) {
        return -1;
      } else if (list2.date.match("No Due Date")) {
        return 1;
      } else {
        return list1Year - list2Year;
      }
    });
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
    // fades out Modal and turns off Event listeners
    if ($('.modal').is(':visible')) {
      $('.modal').fadeOut(500, function() {
        $('form').off('submit');
        $('#mark_complete').off('click');
        $(document).off('click');
      });
    } else {
      $('.modal').fadeIn(500, function() {
        // Adds Event listener for click outside modal
        $(document).on('click', function(e) { 
          if(!$(e.target).closest('.modal').length) {
            toggleModal();
          }        
        })
      });
    }
  }
  
  $('main ul').on('click', function(e) {
    e.preventDefault();
    var todoID = $(e.target).closest('li').attr('data-id');
    if (e.target.nodeName === 'SPAN') {
      displayEditModal(todoID);
    } else if (e.target.nodeName === 'LABEL') {
      if ($('.modal').is(':visible')) {
        toggleModal();
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
    renderPage(currentHeader(), currentTodos());
  }
  
  function markTodoCompleted(todoID) {
    var todo = todos.filter(function(todo) {
      return parseInt(todo.id) === parseInt(todoID);
    })[0];
    todo.completed = 'completed';
    setTodos(todos);
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
  
  // this function iterates through every todo and assigns them to an array in
  // an object with a unique month/year
  function createDatedLists(todos) {
    var datedLists = []
    // { date: '04/17', todos: [todo1, todo2, todo3], numTodos = this.todos.length; }
    
    todos.forEach(function(todo) {
      var dueDate = todo.formattedDueDate;
      
      if (todoExistsInDatedList(dueDate, datedLists)) {
        var listIndex = datedLists.findIndex(function(list) {
          return list.date === dueDate;
        });
        datedLists[listIndex].todos.push(todo);
        datedLists[listIndex].numTodos += 1;
      } else {
        var newDateObject = {}
        newDateObject[dueDate] = [todo];
        datedLists.push({ date: dueDate, todos: [todo], numTodos: 1});
      }
    });
    return datedLists;
  }
  
  // [ {'2/17' : [todo1, todo2]}, {'5/18' : [todo3, todo4]}]
  
  function todoExistsInDatedList(dueDate, datedLists) {
    return datedLists.some(function(list) {
      return list.date === dueDate;
    });
  }
  
  function parseMonth(month) {
    var monthNum = new Date(Date.parse(month +" 1, 2012")).getMonth() + 1;
    if (String(monthNum).length === 1) {
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
    if ($(e.target).text().match('No Due Date')) {
      date = "No Due Date";
      $('h1').css('width', '150px');
    } else {
       $('h1').css('width', '125px');
    }
    
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
    return chosenList.todos || [];
  }
  
  function editTodo(input, todoID) {
    var todo = getTodoByID(todoID);
    todo.title = input[0];
    todo.dueDay = input[1];
    todo.dueMonth = input[2];
    todo.dueYear = input[3];
    todo.description = input[4];
    todo.formattedDueDate = formatDueDate(todo.dueMonth, todo.dueYear);
    setTodos(todos);
  }
 
  
  function addButtonEventListeners(type, todoID) {
    $('form').on('submit', function(e) {
      e.preventDefault();
      var input = serializeFormData();
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
        markTodoCompleted(todoID);
        toggleModal();
      }
    })
  }
  
  function serializeFormData() {
    formDataArray = []
    formDataArray[0] = $('#title').val();
    formDataArray[1] = $('#day').val();
    formDataArray[2] = $('#month').val();
    formDataArray[3] = $('#year').val();
    formDataArray[4] = $('#description').val();
    return formDataArray;
  }
  
  function assignID() {
    id = parseInt(id, 10) + 1;
    localStorage.id = id;
    return id;
  }
  
  function createNewTodo(input) {
    var title = input[0];
    var day = input[1];
    var month = input[2];
    var year = input[3];
    var description = input[4];
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