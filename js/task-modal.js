// Task Manager - Modal for adding new tasks with database integration
document.addEventListener('DOMContentLoaded', function() {
  
  // Create modal HTML and inject into the page
  const modalHTML = `
    <div class="modal fade" id="addTaskModal" tabindex="-1" role="dialog" aria-labelledby="addTaskModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addTaskModalLabel">Agregar Nueva Tarea</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addTaskForm">
              <div class="mb-3">
                <label for="taskName" class="form-label">Nombre de la Tarea</label>
                <input type="text" class="form-control" id="taskName" maxlength="100" placeholder="Ingrese el nombre de la tarea" required>
              </div>
              <div class="mb-3">
                <label for="taskDescription" class="form-label">Descripción</label>
                <textarea class="form-control" id="taskDescription" rows="3" maxlength="250" placeholder="Ingrese la descripción de la tarea" required></textarea>
              </div>
              <div class="mb-3">
                <label for="taskProject" class="form-label">Proyecto</label>
                <select class="form-control" id="taskProject" required>
                  <option value="">Seleccione un proyecto</option>
                  <!-- Projects will be loaded dynamically -->
                </select>
              </div>
              <div class="mb-3">
                <label for="taskDate" class="form-label">Fecha de Vencimiento</label>
                <input type="date" class="form-control" id="taskDate" required>
              </div>
              <div class="mb-3">
                <label for="taskStatus" class="form-label">Estado</label>
                <select class="form-control" id="taskStatus" required>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </form>
            <div id="taskMessage" class="alert" style="display: none;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveTaskBtn">
              <span class="btn-text">Guardar Tarea</span>
              <span class="spinner-border spinner-border-sm" style="display: none;" role="status" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Inject modal into body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal element
  const taskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
  
  // Get the plus button
  const addBtn = document.querySelector('.todo-list-add-btn');
  
  // Get the todo list
  const todoList = document.querySelector('.todo-list');
  
  // Load projects when modal is opened
  document.getElementById('addTaskModal').addEventListener('show.bs.modal', function () {
    loadProjects();
  });
  
  // Function to load projects
  function loadProjects() {
    fetch('php/get_projects.php')
      .then(response => response.json())
      .then(data => {
        const projectSelect = document.getElementById('taskProject');
        projectSelect.innerHTML = '<option value="">Seleccione un proyecto</option>';
        
        if (data.success && data.projects) {
          data.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id_proyecto;
            option.textContent = project.nombre;
            projectSelect.appendChild(option);
          });
        }
      })
      .catch(error => {
        console.error('Error loading projects:', error);
        showMessage('Error al cargar proyectos', 'danger');
      });
  }
  
  // Add click event to plus button
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      taskModal.show();
    });
  }
  
  // Get save button
  const saveBtn = document.getElementById('saveTaskBtn');
  
  // Function to show messages
  function showMessage(message, type) {
    const messageDiv = document.getElementById('taskMessage');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
  
  // Function to toggle loading state
  function setLoading(isLoading) {
    const btnText = saveBtn.querySelector('.btn-text');
    const spinner = saveBtn.querySelector('.spinner-border');
    
    if (isLoading) {
      saveBtn.disabled = true;
      btnText.textContent = 'Guardando...';
      spinner.style.display = 'inline-block';
    } else {
      saveBtn.disabled = false;
      btnText.textContent = 'Guardar Tarea';
      spinner.style.display = 'none';
    }
  }
  
  // Add click event to save button
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const form = document.getElementById('addTaskForm');
      
      // Validate form
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Get form values
      const taskName = document.getElementById('taskName').value;
      const taskDescription = document.getElementById('taskDescription').value;
      const taskProject = document.getElementById('taskProject').value;
      const taskDate = document.getElementById('taskDate').value;
      const taskStatus = document.getElementById('taskStatus').value;
      
      // Show loading state
      setLoading(true);
      
      // Prepare data to send
      const formData = new FormData();
      formData.append('nombre', taskName);
      formData.append('descripcion', taskDescription);
      formData.append('id_proyecto', taskProject);
      formData.append('fecha_vencimiento', taskDate);
      formData.append('estado', taskStatus);
      
      // Send data to server
      fetch('php/save_task.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        
        if (data.success) {
          // Format date for display
          const dateObj = new Date(taskDate);
          const formattedDate = dateObj.toLocaleDateString('es-MX', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          });
          
          // Determine badge based on status
          let badgeClass = 'badge-opacity-warning';
          let badgeText = 'Pendiente';
          
          if (taskStatus === 'completado') {
            badgeClass = 'badge-opacity-success';
            badgeText = 'Completado';
          } else if (taskStatus === 'en-progreso') {
            badgeClass = 'badge-opacity-info';
            badgeText = 'En Progreso';
          }
          
          // Create new task item
          const newTaskHTML = `
            <li class="d-block" data-task-id="${data.task_id}">
              <div class="form-check w-100">
                <label class="form-check-label">
                  <input class="checkbox" type="checkbox" ${taskStatus === 'completado' ? 'checked' : ''}> 
                  ${taskName} 
                  <i class="input-helper rounded"></i>
                </label>
                <div class="d-flex mt-2">
                  <div class="ps-4 text-small me-3">${formattedDate}</div>
                  <div class="badge ${badgeClass} me-3">${badgeText}</div>
                  <i class="mdi mdi-flag ms-2 flag-color"></i>
                </div>
              </div>
            </li>
          `;
          
          // Add new task to the list
          if (todoList) {
            todoList.insertAdjacentHTML('beforeend', newTaskHTML);
          }
          
          // Show success message
          showMessage('Tarea guardada exitosamente', 'success');
          
          // Clear form and close modal after delay
          setTimeout(() => {
            form.reset();
            taskModal.hide();
          }, 1000);
          
        } else {
          showMessage(data.message || 'Error al guardar la tarea', 'danger');
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
        showMessage('Error al conectar con el servidor', 'danger');
      });
    });
  }
  
  // Clear form when modal is closed
  document.getElementById('addTaskModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('addTaskForm').reset();
    document.getElementById('taskMessage').style.display = 'none';
  });
  
});