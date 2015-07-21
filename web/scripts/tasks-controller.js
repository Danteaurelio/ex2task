tasksController = function() {
	function errorLogger(errorCode, errorMessage) {
		console.log(errorCode +':'+ errorMessage);
	}
	//Contar task
	function contaTask() {
	   storageEngine.findAll('task', 
							function(tasks) {
							  var cont =0;
								$.each(tasks, function(index, task) {
									if(task.complete!=true){
									cont=cont+1;
									}
								});
							
								$('#taskCount').empty()
								$('#taskCount').append(cont);
								
							}, 
							errorLogger);
	}
	//Limpar campos do formulário
	  function limpaCampoTask() {
	    $(taskPage).find('form').fromObject({});
	  }
	// Destacar tarefas que já passaram do deadline
	function destacarTask() {
	    $.each($(taskPage).find('#tblTasks tbody tr'), function(idx, row) {
	      var due = Date.parse($(row).find('[datetime]').text());
	      if(due.compareTo(Date.today()) < 0) {
		$(row).addClass("overdue");
	      } else if (due.compareTo((2).days().fromNow()) <= 0) {
		$(row).addClass("warning");
	      }
	    });
	  }
	var taskPage;
	var initialised = false;   
	return {
				init : function(page, callback) {
				if (initialised) {
				callback();
				} else {  
						taskPage = page;
						storageEngine.init(function() {
						storageEngine.initObjectStore('task', function() {
						callback();
				  }, errorLogger)
				}, errorLogger);
				$(taskPage).find( '[required="required"]' ).prev('label').append( '<span>*</span>').children( 'span').addClass('required');
				$(taskPage).find('tbody tr:even').addClass( 'even');
				$(taskPage).find( '#btnAddTask' ).click( function(evt) {
					evt.preventDefault();
					$(taskPage ).find('#taskCreation' ).removeClass( 'not');
				});
				$(taskPage).find('tbody tr' ).click(function(evt) {
					$(evt.target ).closest('td').siblings( ).andSelf( ).toggleClass( 'rowHighlight');
				});
				//Deleta task
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', function(evt) { 					
						
						storageEngine.delete('task', $(evt.target).data().taskId, 
							function() {
								$(evt.target).parents('tr').remove(); 
								contaTask();
							}, errorLogger);
					}
				);	
				//Salva a task
				$(taskPage).find('#saveTask').click(function(evt) {
					evt.preventDefault();
					if ($(taskPage).find('form').valid()) {
						var task = $(taskPage).find('form').toObject();		
						storageEngine.save('task', task, function() {
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks();
							limpaCampoTask();
							$(':input').val('');
							$(taskPage).find('#taskCreation').addClass('not');
						}, errorLogger);
					initialised = true;
					}				
				});
				//Edita task
				$(taskPage).find('#tblTasks tbody').on('click', '.editRow',function(evt){ 
								$(taskPage).find('#taskCreation').removeClass('not');
								storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
									$(taskPage).find('form').fromObject(task);
								}, errorLogger);
							}
				);
				//Realiza a limpeza
				$(taskPage).find('#clearTask').click(function(evt) {
					  evt.preventDefault();
					  limpaCampoTask();
				});
				//Marcar tarefas como completadas
			       $(taskPage).find('#tblTasks tbody').on('click', '.completeRow', function(evt) {           
				  storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
				    task.complete = true;
				    storageEngine.save('task', task, function() {
				      tasksController.loadTasks();
						
				      limpaCampoTask();
				    },errorLogger);
				  }, errorLogger);
				});
			}
    		},
			loadTasks : function() {
			$(taskPage).find('#tblTasks tbody').empty();
			storageEngine.findAll('task',function(tasks) {
					//Ordenação tarefa					
					tasks.sort(function(o1, o2) {
						  return Date.parse(o1.requiredBy).compareTo(Date.parse(o2.requiredBy));
					});
					$.each(tasks, function(index, task) {
					//Carrega a conclusão da tarefa
					if (!task.complete) {
						    task.complete = false;
					 }
					$('#taskRow').tmpl(task).appendTo($(taskPage).find( '#tblTasks tbody'));
									
					contaTask();
					destacarTask();
					});
				}, 
				errorLogger);
		}
	}
}();