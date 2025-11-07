// Load projects when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
});

// Function to load projects from the server
function loadProjects() {
    fetch('php/get_projects.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                showError('Error al cargar los proyectos');
                return;
            }
            displayProjects(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error al conectar con el servidor');
        });
}

// Function to display projects in the table
function displayProjects(projects) {
    const tbody = document.querySelector('.table.select-table tbody');
    
    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <p class="text-muted">No hay proyectos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    projects.forEach((project, index) => {
        const row = createProjectRow(project, index + 1);
        tbody.appendChild(row);
    });
}

// Function to create a table row for a project
function createProjectRow(project, rowNumber) {
    const tr = document.createElement('tr');
    
    // Get status badge class and text
    const statusInfo = getStatusBadge(project.estado);
    
    // Get progress bar color
    const progressColor = getProgressColor(project.progreso);
    
    // Calculate progress fraction (if you have a total tasks field, adjust this)
    const totalTasks = 10; // This should come from your database if available
    const completedTasks = Math.round((project.progreso / 100) * totalTasks);
    
    tr.innerHTML = `
        <td>
            <h6>${rowNumber}</h6>
        </td>
        <td>
            <h6>${escapeHtml(project.nombre)}</h6>
        </td>
        <td>
            <h6>${escapeHtml(project.descripcion)}</h6>
        </td>
        <td>
            <h6>${escapeHtml(project.departamento)}</h6>
        </td>
        <td>
            <h6>${formatDate(project.fecha_cumplimiento)}</h6>
        </td>
        <td>
            <div>
                <div class="d-flex justify-content-between align-items-center mb-1 max-width-progress-wrap">
                    <p class="text-success">${project.progreso}%</p>
                    <p>${completedTasks}/${totalTasks}</p>
                </div>
                <div class="progress progress-md">
                    <div class="progress-bar ${progressColor}" role="progressbar" 
                         style="width: ${project.progreso}%" 
                         aria-valuenow="${project.progreso}" 
                         aria-valuemin="0" 
                         aria-valuemax="100"></div>
                </div>
            </div>
        </td>
        <td>
            <div class="badge ${statusInfo.class}">${statusInfo.text}</div>
        </td>
        <td>
            <h6>${escapeHtml(project.participante)}</h6>
        </td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="editProject(${project.id_proyecto})" title="Editar">
                <i class="mdi mdi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id_proyecto})" title="Eliminar">
                <i class="mdi mdi-delete"></i>
            </button>
            <button class="btn btn-sm btn-info" onclick="viewProgress(${project.id_proyecto})" title="Ver progreso">
                <i class="mdi mdi-chart-line"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// Function to get status badge class and text
function getStatusBadge(estado) {
    const statusMap = {
        'pendiente': {
            class: 'badge-opacity-secondary',
            text: 'Pendiente'
        },
        'en proceso': {
            class: 'badge-opacity-warning',
            text: 'En progreso'
        },
        'vencido': {
            class: 'badge-opacity-danger',
            text: 'Vencido'
        },
        'completado': {
            class: 'badge-opacity-success',
            text: 'Completado'
        }
    };
    
    return statusMap[estado] || { class: 'badge-opacity-secondary', text: estado };
}

// Function to get progress bar color based on percentage
function getProgressColor(progreso) {
    if (progreso < 30) {
        return 'bg-danger';
    } else if (progreso < 70) {
        return 'bg-warning';
    } else {
        return 'bg-success';
    }
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Function to show error message
function showError(message) {
    const tbody = document.querySelector('.table.select-table tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                <p class="text-danger">${message}</p>
            </td>
        </tr>
    `;
}

// Action functions (to be implemented)
function editProject(projectId) {
    // Redirect to edit page or open modal
    window.location.href = `../editarProyecto?id=${projectId}`;
}

function deleteProject(projectId) {
    if (confirm('¿Está seguro de que desea eliminar este proyecto?')) {
        fetch('php/delete_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_proyecto: projectId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Proyecto eliminado exitosamente');
                loadProjects(); // Reload the table
            } else {
                alert('Error al eliminar el proyecto: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar el proyecto');
        });
    }
}

function viewProgress(projectId) {
    // Redirect to progress page
    window.location.href = `../progresoProyecto?id=${projectId}`;
}