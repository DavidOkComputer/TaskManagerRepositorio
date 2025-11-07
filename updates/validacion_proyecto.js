//validacion proyecto js para añadir prouecto

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formProyecto');
    const submitBtn = document.getElementById('btnCrear');
    
    // File upload functionality
    const fileInput = document.querySelector('.file-upload-default');
    const fileUploadBtn = document.querySelector('.file-upload-browse');
    const fileTextInput = fileInput.nextElementSibling.querySelector('input[type="text"]');
    
    fileUploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileTextInput.value = this.files[0].name;
        } else {
            fileTextInput.value = 'Seleccione el archivo para subir';
        }
    });
    
    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        let isValid = true;
        const errors = [];
        
        // Validate nombre
        const nombre = document.getElementById('nombre').value.trim();
        if (nombre === '') {
            showError('nombre', 'El nombre es obligatorio');
            errors.push('Nombre');
            isValid = false;
        }
        
        // Validate descripcion
        const descripcion = document.getElementById('descripcion').value.trim();
        if (descripcion === '') {
            showError('descripcion', 'La descripción es obligatoria');
            errors.push('Descripción');
            isValid = false;
        }
        
        // Validate fecha_inicio
        const fechaInicio = document.getElementById('fecha_inicio').value;
        if (fechaInicio === '') {
            showError('fecha_inicio', 'La fecha de inicio es obligatoria');
            errors.push('Fecha de inicio');
            isValid = false;
        }
        
        // Validate fecha_cumplimiento
        const fechaCumplimiento = document.getElementById('fecha_cumplimiento').value;
        if (fechaCumplimiento === '') {
            showError('fecha_cumplimiento', 'La fecha de entrega es obligatoria');
            errors.push('Fecha de entrega');
            isValid = false;
        }
        
        // Validate dates
        if (fechaInicio && fechaCumplimiento) {
            const inicio = new Date(fechaInicio);
            const cumplimiento = new Date(fechaCumplimiento);
            
            if (cumplimiento <= inicio) {
                showError('fecha_cumplimiento', 'La fecha de entrega debe ser posterior a la fecha de inicio');
                errors.push('Fechas incorrectas');
                isValid = false;
            }
        }
        
        // Validate departamento
        const departamento = document.getElementById('id_departamento').value;
        if (departamento === '' || departamento === '0') {
            showError('id_departamento', 'Debe seleccionar un departamento');
            errors.push('Departamento');
            isValid = false;
        }
        
        // Validate tipo proyecto
        const tipoProyecto = document.querySelector('input[name="tipoProyectoRadios"]:checked');
        if (!tipoProyecto) {
            alert('Debe seleccionar un tipo de proyecto');
            errors.push('Tipo de proyecto');
            isValid = false;
        }
        
        // Validate asignar a
        const asignarA = document.getElementById('id_participante').value;
        if (asignarA === '' || asignarA === '0') {
            showError('id_participante', 'Debe asignar el proyecto a un empleado');
            errors.push('Asignar a');
            isValid = false;
        }
        
        if (!isValid) {
            alert('Por favor complete los siguientes campos:\n- ' + errors.join('\n- '));
            return false;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        
        // Create FormData object
        const formData = new FormData(form);
        
        // Send AJAX request
        fetch('php/procesar_proyecto.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✓ Proyecto creado exitosamente');
                form.reset();
                fileTextInput.value = 'Seleccione el archivo para subir';
                window.location.href = '../revisarProyectos';
            } else {
                alert('✗ Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('✗ Error al procesar la solicitud. Por favor intente nuevamente.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Crear';
        });
    });
    
    // Helper functions
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-invalid');
            
            // Create error message element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            
            // Insert after the field
            field.parentNode.appendChild(errorDiv);
        }
    }
    
    function clearErrors() {
        // Remove all error classes
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        // Remove all error messages
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.remove();
        });
    }
    
    // Clear error on input
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const errorMsg = this.parentNode.querySelector('.invalid-feedback');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
});