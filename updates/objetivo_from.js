// objetivo-form.js - Handle objective creation form

document.addEventListener('DOMContentLoaded', function() {
    // Load departments on page load
    loadDepartamentos();
    
    // Initialize file upload
    initFileUpload();
    
    // Form submission handler
    const form = document.getElementById('formCrearObjetivo');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel button handler
    const cancelBtn = document.querySelector('.btn-light');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea cancelar? Se perderán los datos ingresados.')) {
                form.reset();
                document.getElementById('fileUploadLabel').value = '';
            }
        });
    }
});

/**
 * Load departments from database and populate dropdown
 */
function loadDepartamentos() {
    fetch('../php/get_departamentos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('id_departamento');
                
                // Clear existing options except the first one
                select.innerHTML = '<option value="">Seleccione un departamento</option>';
                
                // Add departments
                data.data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.nombre;
                    select.appendChild(option);
                });
            } else {
                showNotification('Error al cargar departamentos: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cargar los departamentos', 'error');
        });
}

/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    const fileInput = document.querySelector('.file-upload-default');
    const fileLabel = document.getElementById('fileUploadLabel');
    const uploadBtn = document.querySelector('.file-upload-browse');
    
    if (uploadBtn && fileInput && fileLabel) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileLabel.value = this.files[0].name;
            } else {
                fileLabel.value = '';
            }
        });
    }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    
    // Get file input
    const fileInput = document.querySelector('.file-upload-default');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('archivo', fileInput.files[0]);
    }
    
    // Add creator ID (you should get this from session or user data)
    // For now, using a placeholder - replace with actual logged-in user ID
    const idCreador = getUserId(); // Implement this function based on your auth system
    formData.append('id_creador', idCreador);
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando...';
    
    // Submit form
    fetch('../php/crear_objetivo.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Objetivo creado exitosamente', 'success');
            
            // Reset form after 1 second
            setTimeout(() => {
                this.reset();
                document.getElementById('fileUploadLabel').value = '';
                
                // Optionally redirect to objectives list
                // window.location.href = '../revisarObjetivos';
            }, 1500);
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al crear el objetivo. Por favor, intente nuevamente.', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

/**
 * Validate form data
 */
function validateForm(formData) {
    const nombre = formData.get('nombre');
    const descripcion = formData.get('descripcion');
    const fecha_cumplimiento = formData.get('fecha_cumplimiento');
    const id_departamento = formData.get('id_departamento');
    
    // Check required fields
    if (!nombre || nombre.trim() === '') {
        showNotification('El nombre es requerido', 'warning');
        document.getElementById('nombre').focus();
        return false;
    }
    
    if (nombre.length > 100) {
        showNotification('El nombre no puede exceder 100 caracteres', 'warning');
        document.getElementById('nombre').focus();
        return false;
    }
    
    if (!descripcion || descripcion.trim() === '') {
        showNotification('La descripción es requerida', 'warning');
        document.getElementById('descripcion').focus();
        return false;
    }
    
    if (descripcion.length > 200) {
        showNotification('La descripción no puede exceder 200 caracteres', 'warning');
        document.getElementById('descripcion').focus();
        return false;
    }
    
    if (!fecha_cumplimiento) {
        showNotification('La fecha de cumplimiento es requerida', 'warning');
        document.getElementById('fecha_cumplimiento').focus();
        return false;
    }
    
    // Validate date is in the future
    const selectedDate = new Date(fecha_cumplimiento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('La fecha de cumplimiento debe ser posterior a hoy', 'warning');
        document.getElementById('fecha_cumplimiento').focus();
        return false;
    }
    
    if (!id_departamento || id_departamento === '') {
        showNotification('Debe seleccionar un departamento', 'warning');
        document.getElementById('id_departamento').focus();
        return false;
    }
    
    // Validate file size if present
    const fileInput = document.querySelector('.file-upload-default');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            showNotification('El archivo no puede exceder 10MB', 'warning');
            return false;
        }
    }
    
    return true;
}

/**
 * Get user ID from session or local storage
 * TODO: Implement this based on your authentication system
 */
function getUserId() {
    // This is a placeholder - implement based on your auth system
    // You might get this from:
    // - A hidden input field
    // - Session storage
    // - A global JavaScript variable set by PHP
    // - An API call
    
    // Example: return sessionStorage.getItem('userId');
    // For now, returning a default value
    return 1; // Replace with actual user ID
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Check if a notification container exists
    let container = document.getElementById('notificationContainer');
    
    if (!container) {
        // Create notification container
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${getAlertClass(type)} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <strong>${getAlertTitle(type)}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 5000);
}

/**
 * Get Bootstrap alert class based on type
 */
function getAlertClass(type) {
    const classes = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return classes[type] || 'info';
}

/**
 * Get alert title based on type
 */
function getAlertTitle(type) {
    const titles = {
        'success': '¡Éxito!',
        'error': 'Error:',
        'warning': 'Advertencia:',
        'info': 'Información:'
    };
    return titles[type] || 'Aviso:';
}

/**
 * Character counter for text inputs
 */
function setupCharacterCounters() {
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    
    if (nombreInput) {
        addCharacterCounter(nombreInput, 100);
    }
    
    if (descripcionInput) {
        addCharacterCounter(descripcionInput, 200);
    }
}

function addCharacterCounter(input, maxLength) {
    const counter = document.createElement('small');
    counter.className = 'form-text text-muted';
    counter.textContent = `0/${maxLength} caracteres`;
    
    input.parentElement.appendChild(counter);
    
    input.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = `${length}/${maxLength} caracteres`;
        
        if (length > maxLength) {
            counter.classList.add('text-danger');
            counter.classList.remove('text-muted');
        } else {
            counter.classList.add('text-muted');
            counter.classList.remove('text-danger');
        }
    });
}

// Initialize character counters when DOM is ready
document.addEventListener('DOMContentLoaded', setupCharacterCounters);