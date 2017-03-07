$(function() {
  var id;
  var todos;
  var listsTemplate;
  var todosTemplate;
    
  var Todo = {
    init: function(title, dueDay, dueMonth, dueYear, description, id, completed) {
      this.title = title;
      this.dueDay = dueDay;
      this.dueMonth = dueMonth;
      this.dueYear = dueYear;
      this.description = description;
      this.completed = completed || 'notCompleted';
      this.id = id;
      this.formattedDueDate = this.formatDueDate();
      this.__proto__ = Todo;
      return this;
    },
    formatDueDate: function() {
      if (this.dueMonth === null || this.dueYear === null) {
        return "No Due Date";
      } else {
        return this.parseMonth(month) + '/' + this.parseYear(year);
      }
    },
    parseMonth: function () {
      var monthNum = new Date(Date.parse(this.dueMonth +" 1, 2012")).getMonth() + 1;
      if (String(monthNum).length === 1) {
        monthNum = '0' + monthNum;
      }
      return monthNum;
    },
    parseYear: function () {
      return this.dueYear.slice(2);
    },
    toggleCompleted: function() {
      if (this.completed === 'notCompleted') {
        this.completed = 'completed';
      } else {
        this.completed = 'notCompleted';
      }
      TodoProgram.renderNav();
      TodoProgram.renderMain();
    },
    markCompleted: function() {
      this.completed = 'completed';
      TodoProgram.renderNav();
      TodoProgram.renderMain();
    },
    editTodo: function(input) {
      this.title = input[0];
      this.dueDay = input[1];
      this.dueMonth = input[2];
      this.dueYear = input[3];
      this.description = input[4];
      this.formattedDueDate = this.formatDueDate();
    },
  };
  
  var TodoCollection = {
    init: function(category, title, todos) {
      this.category = category;
      this.title = title;
      this.todos = todos;
      // this.active = ""
      return this;
    },
    deleteTodo: function(todo) {
      // removes todo from todo Array and resaves array in storage
      matchingTodoIndex = this.todos.findIndex(function(todoMatch) {
        return parseInt(todo.id) === parseInt(todoMatch.id);
      });
      todos.splice(matchingTodoIndex, 1);
      TodoProgram.renderNav();
      TodoProgram.renderMain();
    },
    numTodos: function() {
      return this.todos.length;
    },
    filterCompletedTodos: function() {
      return this.todos.filter(function(todo) {
        return todo.completed === 'completed';
      });
    },
    getTodoByID: function(todoID) {
      return this.todos.filter(function(todo) {
        return parseInt(todo.id) === parseInt(todoID);
      })[0];
    },
    sortByComplete: function() {
      return this.todos.sort(function(todo1, todo2) {
        if (todo1.completed === 'notCompleted' && todo2.completed === 'completed') {
          return -1;
        } else if (todo1.completed === 'completed' && todo2.completed === 'notCompleted') {
          return 1;
        } else {
          return parseInt(todo1.id) - parseInt(todo2.id);
        }
      })
    }
  };
  
  var TodoCollections = {
    init: function() {
      this.allTodos = Object.create(TodoCollection).init('All Todos', 'All Todos', todos);
      this.activeCollection = { category: 'All Todos', title: 'All Todos' };
      return this;
    },
    assignID: function() {
      id = parseInt(id, 10) + 1;
      localStorage.id = id;
      return id;
    },
    allCollections: function() {
      return [this.allTodos].concat([this.completedTodos()]).concat(this.datedTodos()).concat(this.datedCompletedTodos());
    },
    completedTodos: function() {
      return Object.create(TodoCollection).init('Completed', 'Completed', this.allTodos.filterCompletedTodos());
    },
    datedTodos: function() {
      return this.createDatedCollections(this.allTodos);
    },
    datedCompletedTodos: function() {
      return this.createDatedCollections(this.completedTodos());
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
    createNewTodo: function(input) {
      var title = input[0];
      var day = input[1];
      var month = input[2];
      var year = input[3];
      var description = input[4];
      var id = this.assignID();
      this.allTodos.todos.push(Object.create(Todo).init(title, day, month, year, description, id));
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
    getActiveCollection: function() {
      var self = this;
      return this.allCollections().filter(function(collection) {
        return collection.category === self.activeCollection.category && collection.title === self.activeCollection.title;
      })[0];
      
    },
    setActiveCollection: function(category, title) {
      $("[data-title=" +"'" + category + " " + title + "'" +"]").addClass('active');
      this.activeCollection = { category: category, title: title };
    },
    removeCurrentActiveCollection: function() {
      $('.active').removeClass('active');
    },
  };
  
  var TodoProgram = {
    init: function() {
      id = localStorage.id || 0;
      todos = this.getTodos() || [];
      // This step recreates Todo Objects since JSON stringify doens't include functions/methods
      todos = this.parseTodos();
      todoCollections = Object.create(TodoCollections).init();
      this.createPartials();
      this.initialEventListeners();
      this.renderNav();
      this.renderMain();
    },
    parseTodos: function() {
      if (todos.length > 0) {
        return todos.map(function(todo) {
          return Object.create(Todo).init(todo.title, todo.dueDay, todo.dueMonth, todo.dueYear, todo.description, todo.id, todo.completed);
        });
      } else {
        return todos;
      }
    },
    createPartials: function() {
      listsTemplate = Handlebars.compile($('#all_todos_lists').html());
      todosTemplate = Handlebars.compile($('#todos').html());
    },
    initialEventListeners: function() {
      var self = this;
      // Event Listener for Add New
      $('.add_new').on('click', function(e) {
        e.preventDefault();
        self.displayModal();
        self.addButtonEventListeners('new')
      })
      
      // Event Listener for clicking on element in Main Todo area
       $('main ul').on('click', function(e) {
        e.preventDefault();
        var todoID = $(e.target).closest('li').attr('data-id');
        var todo = todoCollections.allTodos.getTodoByID(todoID);
        if (e.target.nodeName === 'SPAN') {
          self.displayEditModal(todoID);
        } else if (e.target.nodeName === 'LABEL') {
          if ($('.modal').is(':visible')) {
            self.toggleModal();
          } else {
            todo.toggleCompleted();
          }
        } else if (e.target.nodeName === 'A' || e.target.nodeName === 'IMG') {
          todoCollections.allTodos.deleteTodo(todo);
        }
      });
      
      // Event Listener for clicking on Nav list item
      $('nav ul').on('click', 'li', function(e) {
        e.preventDefault();
        var title = $(e.target).text().split(' ')[0];
        if ($(e.target).text().match('No Due Date')) {
          title = "No Due Date";
          $('h1').css('width', '150px');
        } else {
           $('h1').css('width', '125px');
        }
        if ($(e.target).closest('ul').hasClass('all')) {
          var category = 'All Todos';
        } else {
          var category = 'Completed';
        }
        todoCollections.removeCurrentActiveCollection();
        todoCollections.setActiveCollection(category, title);
        self.renderMain();
      })
      
      // Event Listener for clicking on Nav Header
      $('nav h2').on('click', function(e) {
        e.preventDefault();
        if ($(e.target).text().match('All Todos')) {
          var category = "All Todos"
          var title = "All Todos"
        } else if ($(e.target).text().match('Completed')) {
          var category = "Completed"
          var title = "Completed"
        }
        todoCollections.removeCurrentActiveCollection();
        todoCollections.setActiveCollection(category, title);
        self.renderMain();
      })
      
      $(window).on('unload', function(e) {
        self.setTodos();
      })
    },
    addButtonEventListeners: function(type, todo) {
      self = this;
      $('form').on('submit', function(e) {
      e.preventDefault();
      var input = self.serializeFormData();
      if (type === 'new') {
        todoCollections.createNewTodo(input);
        todoCollections.setActiveCollection('All Todos', 'All Todos');
      } else if (type === 'edit') {
        todo.editTodo(input);
      }
      self.toggleModal();
      self.renderNav();
      self.renderMain();
    })
    $('#mark_complete').on('click', function(e) {
      e.preventDefault();
      if (type === 'new') {
        alert("Cannot mark item complete since it hasn't been created yet!")
      } else {
        todo.markCompleted();
        self.toggleModal();
      }
    })
    },
    serializeFormData: function() {
      var formDataArray = [];
      formDataArray[0] = $('#title').val();
      formDataArray[1] = $('#day').val();
      formDataArray[2] = $('#month').val();
      formDataArray[3] = $('#year').val();
      formDataArray[4] = $('#description').val();
      return formDataArray;
    },
    renderNav: function() {
      $('[data-title="All Todos All Todos"] + ul').html(listsTemplate({lists: todoCollections.sortByDate(todoCollections.datedTodos())}));
      $('.all_todos .count').text(todoCollections.allTodos.numTodos());
      $('.completed + ul').html(listsTemplate({lists: todoCollections.sortByDate(todoCollections.datedCompletedTodos())}));
      $('h2.completed .count').text(todoCollections.completedTodos().numTodos());
      $('ul.completed li').addClass('completed');
      todoCollections.setActiveCollection(todoCollections.activeCollection.category, todoCollections.activeCollection.title);
      },
    renderMain: function() {
      var activeCollection = todoCollections.getActiveCollection();
      if (activeCollection) {
        var numTodos = activeCollection.numTodos();
        var todos = activeCollection.sortByComplete();
      } else {
        var numTodos = 0;
        var todos = [];
      }
      var title = todoCollections.activeCollection.title;
      $('main h1 .title').text(title);
      $('main h1 .count').text(numTodos);
      $('main ul').html(todosTemplate({todos: todos}));
    },
    displayModal: function(todo) {
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
    this.toggleModal();
    },
    displayEditModal: function(todoID) {
      var todo = todoCollections.allTodos.getTodoByID(todoID);
      this.displayModal(todo);
      this.addButtonEventListeners('edit', todo);
    },
    toggleModal: function() {
       var self = this;
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
              self.toggleModal();
            }        
          })
        });
      }
    },
    setTodos: function() {
       localStorage.setItem('todos', JSON.stringify(todoCollections.allTodos.todos));
    },
    getTodos: function() {
      return JSON.parse(localStorage.getItem('todos'));
    },
  }
 
  
  TodoProgram.init();
})


