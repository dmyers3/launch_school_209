$(function() {
  var id;
  var todos;
  var listsTemplate;
  var todosTemplate;
    
  var Todo = {
    assignID: function() {
      id = parseInt(id, 10) + 1;
      localStorage.id = id;
      return id;
    },
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
    },
  };
  
  var TodoCollection = {
    init: function(category, title, todos) {
      this.category = category;
      this.title = title;
      this.todos = todos;
      this.active = ""
      return this;
    },
    numTodos: function() {
      return this.todos.length;
    },
    filterCompletedTodos: function() {
      return this.todos.filter(function(todo) {
        return todo.completed === 'completed';
      });
    },
    
    sortByComplete: function() {
      
    }
  };
  
  var TodoCollections = {
    init: function() {
      this.allTodos = Object.create(TodoCollection).init('All Todos', 'All Todos', todos);
      this.completedTodos = Object.create(TodoCollection).init('Completed Todos', 'Completed Todos', this.allTodos.filterCompletedTodos());
      this.datedTodos = this.createDatedCollections(this.allTodos);
      this.datedCompletedTodos = this.createDatedCollections(this.completedTodos);
      this.allCollections = [this.allTodos].concat([this.completedTodos]).concat(this.datedTodos).concat(this.datedCompletedTodos);
      console.log(this.allCollections);
      return this;
    },
    createDatedCollections: function(collection) {
      var datedCollections = []
      var self = this;
      collection.todos.forEach(function(todo) {
        var dueDate = todo.formattedDueDate;
        if (self.todoDateExists(dueDate, datedCollections)) {
          var listIndex = datedCollections.findIndex(function(list) {
            return list.title === dueDate;
          });
          datedCollections[listIndex].todos.push(todo);
        } else {
          datedCollections.push(Object.create(TodoCollection).init(collection.category, dueDate, [todo]));
        }
      });
      return datedCollections;
    },
    todoDateExists: function(dueDate, datedLists) {
      return datedLists.some(function(list) {
      return list.title === dueDate;
      });
    },
    sortByDate: function(collection) {
      return collection.sort(function(list1, list2) {
        var list1Date = parseInt(list1.title.slice(3)) + parseInt(list1.title.slice(0,2))/13;
        var list2Date = parseInt(list2.title.slice(3)) + parseInt(list2.title.slice(0,2))/13;
        if (list1.title.match("No Due Date")) {
          return -1;
        } else if (list2.title.match("No Due Date")) {
          return 1;
        } else {
          return list1Date - list2Date;
        }
      });
    },
    
  };
  
  var TodoProgram = {
    init: function() {
      id = localStorage.id || 0;
      todos = getTodos() || [];
      todoCollections = Object.create(TodoCollections).init();
      this.createPartials();
      this.eventListeners();
      this.renderNav();
      this.renderMain();
    },
    createPartials: function() {
      listsTemplate = Handlebars.compile($('#all_todos_lists').html());
      todosTemplate = Handlebars.compile($('#todos').html());
    },
    eventListeners: function() {
      // Event Listener for Add New
      $('.add_new').on('click', function(e) {
        e.preventDefault();
        displayModal();
        addButtonEventListeners('new')
      })
      
      // Event Listener for clicking on element in Main Todo area
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
      
      // Event Listener for clicking on Nav list item
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
      
      // Event Listener for clicking on Nav Header
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
    },
    renderNav: function() {
      $('.all_todos + ul').html(listsTemplate({lists: todoCollections.sortByDate(todoCollections.datedTodos)}));
      console.log(todoCollections.sortByDate(todoCollections.datedTodos));
      $('.all_todos .count').text(todoCollections.allTodos.numTodos());
      $('.completed + ul').html(listsTemplate({lists: todoCollections.sortByDate(todoCollections.datedCompletedTodos)}));
      $('h2.completed .count').text(todoCollections.completedTodos.numTodos());
      $('ul.completed li').addClass('completed');
      },
    renderMain: function() {
      $('main h1 .title').text(this.activeTitle());
      $('main h1 .count').text(todos.length);
      $('main ul').html(todosTemplate({todos: sortTodos(todos)}));
    },
    activeTitle: function() {
      return "All Todos";
    }
  }
  
  
  // initialize todoCollection with all todos
  // initialize completed TodoCollection
  // initialize all todos dated collections
  // intialize completed todos dated collections
  // add all those collections to TodoCollectionOfCollections
  // create partials
  // add initial Event Listeners
  
  
  
  // have todo which has several components
  // have todo collection which is group of todos with something in common (either date or all todos/completed todos)
  // have collections for all todos, then a collection for every unique month/year
  //   create completed collections based off the above by using array filter
  
  // click Add new Todo
  //   pops up Modal with form empty
  //   add Button Listeners for submit/mark complete buttons
  //   remove those listeners once button is pressed or modal clicked out of
  //   mark complete button should give 'cant do this yet' alert
  //   submit button creates new Todo
  //     serialize form and initialize new Todo Object with that info
  //     if month or year missing make it 'No Due Date' 
  //   add newly created Todo to AllTodos Collection and date Collection if exists
  //     if date collectino doesn't exist create one with matching date title
  //   make allTodos collection active collection and display that collection
    
  // click name of already created Todo
  //   pop up Modal with form populated with todo data
  //   add Button Listeners for submit/mark complete buttons
  //   remove listeners once button pressed or modal off
  //   mark complete makes todo completed value = completed
  //   submit button edits todo, if date changes then remove from current date collection
  //     and add to correct one if exists, if not create new date collection
  //     if old date collection now has 0 elements can delete that collection
  //   current collection stays active
  
  // delete todo
  //   go into all todo collection and remove, go into date collection and remove
  //   current collection stays active
    
  // clicking around name of created todo
  //   toggles completeness of todo
  //   current collection stays active
    
  // Nav clicks
  //   make that collection active, display it in main area
    

  
  function formatDueDate(month, year) {
    if (month === null || year === null) {
      return "No Due Date";
    } else {
      return parseMonth(month) + '/' + parseYear(year);
    }
  }
  
  function renderPage(title, todos) {
    renderNav();
    renderMain(title, todos);
  }

  
  function setTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
    // updates todo lists - could refactor this later so that instead of recreating
    // lists from scracth you can find and remove/add/update specific todo
    completedTodos = filterCompletedTodos();
    completedTodoListsByDate = createDatedLists(completedTodos);
    todoListsByDate = createDatedLists(todos);
  }
  
  function getTodos() {
    return JSON.parse(localStorage.getItem('todos'));
  }
  
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
  
  function sortByDate(dateArray) {
   
  }
 
  function filterCompletedTodos() {
   
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
  
  // gets list of currently displayed todos so they can be redisplayed after action
  // not requiring showing all todos
  function currentTodos() {
    var header = currentHeader().trim();
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
  
  // sorts by completeness
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
  // an object with a unique month/year. Each object is then contained in an array
  // e.g { date: '04/17', todos: [todo1, todo2, todo3], numTodos = todos.length; }
  function createDatedLists(todos) {
    
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
  
  // increments id to always remain unique and stores it in localStorage
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
    todos.push(Object.create(Todo).init(title, day, month, year, description, id));
    setTodos(todos);
  }
  
  TodoProgram.init();
  
  
  
  
})


