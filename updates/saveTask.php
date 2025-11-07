<?php
// save_task.php - Handles saving new tasks to the database

header('Content-Type: application/json');

// Include database configuration
require_once('db_config.php');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Get POST data
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
$id_proyecto = isset($_POST['id_proyecto']) ? intval($_POST['id_proyecto']) : 0;

// Validate required fields
if (empty($nombre)) {
    echo json_encode([
        'success' => false,
        'message' => 'El nombre de la tarea es requerido'
    ]);
    exit;
}

if (empty($descripcion)) {
    echo json_encode([
        'success' => false,
        'message' => 'La descripción es requerida'
    ]);
    exit;
}

if ($id_proyecto <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Debe seleccionar un proyecto válido'
    ]);
    exit;
}

// Validate field lengths
if (strlen($nombre) > 100) {
    echo json_encode([
        'success' => false,
        'message' => 'El nombre no puede exceder 100 caracteres'
    ]);
    exit;
}

if (strlen($descripcion) > 250) {
    echo json_encode([
        'success' => false,
        'message' => 'La descripción no puede exceder 250 caracteres'
    ]);
    exit;
}

try {
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO tbl_tareas (nombre, descripcion, id_proyecto) VALUES (?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    // Bind parameters
    $stmt->bind_param("ssi", $nombre, $descripcion, $id_proyecto);
    
    // Execute statement
    if ($stmt->execute()) {
        $task_id = $stmt->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Tarea guardada exitosamente',
            'task_id' => $task_id
        ]);
    } else {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    // Close statement
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar la tarea: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>