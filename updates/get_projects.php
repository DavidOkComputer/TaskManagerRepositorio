<?php
// get_projects.php - Retrieves all projects from the database for nueva tarea and maybe proyect list

header('Content-Type: application/json');

// Include database configuration
require_once('db_config.php');

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    // Query to get all projects
    $query = "SELECT id_proyecto, nombre FROM tbl_proyectos ORDER BY nombre ASC";
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }
    
    $projects = [];
    
    while ($row = $result->fetch_assoc()) {
        $projects[] = [
            'id_proyecto' => $row['id_proyecto'],
            'nombre' => $row['nombre']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'projects' => $projects
    ]);
    
    // Free result
    $result->free();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar proyectos: ' . $e->getMessage(),
        'projects' => []
    ]);
}

// Close connection
$conn->close();
?>