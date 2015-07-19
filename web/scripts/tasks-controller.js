tasksController = function() {

	function errorLogger(errorCode, errorMessage) {
		console.log(errorCode +':'+ errorMessage);
	}
	
	var taskPage;
	var initialised = false;   
	return {
		init : function(page) {
			if (!initialised) {
	
				storageEngine.init(function() {
						storageEngine.initObjectStore('task', function() {}, 
						errorLogger) 
				}, errorLogger);
				
				taskPage = page;
				$(taskPage).find( '[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required');
				
				$(taskPage).find('tbody tr:even').addClass( 'even');
				
				$(taskPage).find( '#btnAddTask' ).click( function(evt) {
					evt.preventDefault();
					$(taskPage ).find('#taskCreation' ).removeClass( 'not');
				});
				
				$('#tblTasks tbody').on('click',
					function(evt) {
						$(evt.target ).closest('td').siblings( ).andSelf( ).toggleClass('rowHighlight');
				});
				
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', 
					function(evt) { 					
						storageEngine.delete('task', $(evt.target).data().taskId, 
							function() {
								$(evt.target).parents('tr').remove();
								tasksController.contTasks();
						
							}, errorLogger);
					}
				);	

				$(taskPage).find('#tblTasks tbody').on('click', '.editRow', 
					function(evt) { 
						$(taskPage).find('#taskCreation').removeClass('not');
						storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
							$(taskPage).find('form').fromObject(task);
						}, errorLogger);
					}
				);
				
				//Limpar campos
			    $(taskPage).find('#clearTask').click(function(evt) {
						$(':input').val('');
						
					}
				);
			
				$(taskPage).find('#saveTask').click(function(evt) {
					evt.preventDefault();
					if ($(taskPage).find('form').valid()) {
						var task = $(taskPage).find('form').toObject();		
						storageEngine.save('task', task, function() {
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks();
							$(':input').val('');
							$(taskPage).find('#taskCreation').addClass('not');
						}, errorLogger);
					}
				});
				
			// Task completada
				$(taskPage).find('#tblTasks tbody').on('click', '.completeRow', function(evt) {           
				  storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
				    task.completada = true;
				    storageEngine.save('task', task, function() {
				      	$(taskPage).find('#tblTasks tbody').empty();
						tasksController.loadTasks()
					 },errorLogger);
				  }, errorLogger);
				});
				
				initialised = true;
			}
    	},		
		loadTasks : function() {
						storageEngine.findAll('task', 
							function(tasks) {
									
									//Ordenar por data
							        tasks.sort(function(o1, o2) {
										  return Date.parse(o1.requiredBy).compareTo(Date.parse(o2.requiredBy));
									});

							
							  		$.each(tasks, function(index, task) {
									$('#taskRow').tmpl(task ).appendTo($(taskPage).find( '#tblTasks tbody'));	
										
									if (!task.completada) {
						    			task.completada = false;
					 				}	
						
										
									// Destacar tarefas que já passaram do deadline	
									var hoje = Date.parse(Date.today().toString('yyyy-MM-dd'));
									var dataTarefa = Date.parse(task.requiredBy);
										
									if(dataTarefa.compareTo(hoje)<0) {
										$(taskPage).find("#"+task.id).addClass("overdue");
										   console.log('overdue');
										  } else 
											  if (hoje.addDays(1).compareTo(dataTarefa)==0) {											  
											   console.log('passou');
											   $(taskPage).find("#"+task.id).addClass("warning");
											  
										  }	
												
									 //------------------------
								
									});
							
							tasksController.contTasks();
								
							}, 
							errorLogger);
		},		
		
		//Contagem de tarefas
		contTasks : function() {
						storageEngine.findAll('task', 
							function(tasks) {
							  var cont =0;
								$.each(tasks, function(index, task) {
									console.log(!task.completada);
									if(task.completada!=true){
									cont=cont+1;
									}
								});
							
								$('#taskCount').empty()
								$('#taskCount').append(cont);
								
							}, 
							errorLogger);
		}
		
	
	}
}();
