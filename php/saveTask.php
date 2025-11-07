<?php
// save_task.php

header('Content-Type: application/json');

//incluir configuracion de db
require_once('db_config.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
$id_proyecto = isset($_POST['id_proyecto']) ? intval($_POST['id_proyecto']) : 0;

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
    //se prepara la query sql
    $stmt = $conn->prepare("INSERT INTO tbl_tareas (nombre, descripcion, id_proyecto) VALUES (?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    $stmt->bind_param("ssi", $nombre, $descripcion, $id_proyecto);
    
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
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar la tarea: ' . $e->getMessage()
    ]);
}

$conn->close();
?>