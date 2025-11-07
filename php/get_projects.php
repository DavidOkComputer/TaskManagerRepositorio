<?php
// get_projects.php 

header('Content-Type: application/json');

require_once('db_config.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    //query para ver todos los proyectos
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
    
    $result->free();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar proyectos: ' . $e->getMessage(),
        'projects' => []
    ]);
}

$conn->close();
?>