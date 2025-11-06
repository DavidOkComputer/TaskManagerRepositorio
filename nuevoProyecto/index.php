<!-- Replace the form section in your nuevoProyecto.php with this code -->

<div class="col-12 grid-margin stretch-card">
  <div class="card card-rounded">
    <div class="card-body">
      <div class="d-sm-flex justify-content-between align-items-start">
        <div>
          <h4 class="card-title card-title-dash">Gestión de proyectos</h4>
          <p class="card-subtitle card-subtitle-dash">Revisa y gestiona los proyectos</p>
        </div>
        <div>
          <a href="../revisarProyectos">
            <button class="btn btn-success btn-lg text-white mb-0 me-0" type="button">
              <i class="mdi mdi-checkbox-multiple-marked"></i>Ver lista de proyectos
            </button>
          </a>
        </div>
      </div>
      <div><br></div>
      
      <!-- UPDATED FORM -->
      <form id="formProyecto" enctype="multipart/form-data">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Nombre*</label>
              <div class="col-sm-9">
                <input type="text" class="form-control" id="nombre" name="nombre" required/>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Descripción*</label>
              <div class="col-sm-9">
                <input type="text" class="form-control" id="descripcion" name="descripcion" required/>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Fecha de inicio*</label>
              <div class="col-sm-9">
                <input type="date" class="form-control" id="fecha_inicio" name="fecha_inicio" required/>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Fecha de entrega*</label>
              <div class="col-sm-9">
                <input type="date" class="form-control" id="fecha_cumplimiento" name="fecha_cumplimiento" required/>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Departamento*</label>
              <div class="col-sm-9">
                <select class="form-control" id="id_departamento" name="id_departamento" required>
                  <option value="0">Seleccione un departamento</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">AR (Opcional)</label>
              <div class="col-sm-9">
                <input type="text" class="form-control" id="ar" name="ar"/>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Tipo de proyecto*</label>
              <div class="col-sm-4">
                <div class="form-check form-check-success">
                  <label class="form-check-label">
                    <input type="radio" class="form-check-input" name="tipoProyectoRadios" id="tipoProyectoRadios1" value="1" checked>
                    Individual
                  </label>
                </div>
              </div>
              <div class="col-sm-5">
                <div class="form-check form-check-success">
                  <label class="form-check-label">
                    <input type="radio" class="form-check-input" name="tipoProyectoRadios" id="tipoProyectoRadios2" value="2">
                    Grupal
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label class="col-sm-3 col-form-label">Asignar a*</label>
              <div class="col-sm-9">
                <select class="form-control" id="id_participante" name="id_participante" required>
                  <option value="0">Seleccione un empleado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label for="subirArchivo" class="col-sm-3 col-form-label">Subir archivo</label>
              <div class="col-sm-9">
                <input type="file" name="archivo" class="file-upload-default" id="archivo" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar">
                <div class="input-group">
                  <input type="text" class="form-control" disabled placeholder="Seleccione el archivo para subir">
                  <span class="input-group-append">
                    <button class="file-upload-browse btn btn-success" type="button">Subir</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <button type="submit" class="btn btn-success" id="btnCrear">Crear</button>
            <button type="button" class="btn btn-light" onclick="window.location.href='../revisarProyectos'">Cancelar</button>
          </div>
        </div>
      </form>
      
    </div>
  </div>
</div>

<!-- Add this script before the closing </body> tag -->
<script src="../js/validacion_proyecto.js"></script>
<script>
// Load dropdown data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load departments
    fetch('php/obtener_datos.php?tipo=departamentos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('id_departamento');
                data.data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.nombre;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading departments:', error));
    
    // Load employees
    fetch('php/obtener_datos.php?tipo=empleados')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('id_participante');
                data.data.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = emp.nombre_completo + ' (' + emp.num_empleado + ')';
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading employees:', error));
});
</script>