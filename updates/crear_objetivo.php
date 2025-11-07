<?php
header('Content-Type: application/json');
require_once('db_config.php');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

$response = ['success' => false, 'message' => ''];

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método de solicitud inválido');
    }

    // Validate required fields
    $required_fields = ['nombre', 'descripcion', 'fecha_cumplimiento', 'id_departamento', 'id_creador'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            throw new Exception("El campo {$field} es requerido");
        }
    }

    // Sanitize inputs
    $nombre = trim($_POST['nombre']);
    $descripcion = trim($_POST['descripcion']);
    $fecha_cumplimiento = trim($_POST['fecha_cumplimiento']);
    $id_departamento = intval($_POST['id_departamento']);
    $id_creador = intval($_POST['id_creador']);
    $ar = isset($_POST['ar']) ? trim($_POST['ar']) : '';

    // Validate field lengths
    if (strlen($nombre) > 100) {
        throw new Exception('El nombre no puede exceder 100 caracteres');
    }
    if (strlen($descripcion) > 200) {
        throw new Exception('La descripción no puede exceder 200 caracteres');
    }

    // Validate date format (expecting YYYY-MM-DD from input type="date")
    $date = DateTime::createFromFormat('Y-m-d', $fecha_cumplimiento);
    if (!$date || $date->format('Y-m-d') !== $fecha_cumplimiento) {
        throw new Exception('Formato de fecha inválido');
    }

    // Handle file upload
    $archivo_adjunto = '';
    $upload_dir = '../uploads/objetivos/';
    
    if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            // Create upload directory if it doesn't exist
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }

            // Validate file size (max 10MB)
            $max_size = 10 * 1024 * 1024; // 10MB
            if ($_FILES['archivo']['size'] > $max_size) {
                throw new Exception('El archivo no puede exceder 10MB');
            }

            // Get file extension
            $file_name = $_FILES['archivo']['name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            // Allowed extensions
            $allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
            if (!in_array($file_ext, $allowed_extensions)) {
                throw new Exception('Tipo de archivo no permitido');
            }

            // Generate unique filename
            $new_filename = uniqid('obj_') . '_' . time() . '.' . $file_ext;
            $upload_path = $upload_dir . $new_filename;

            // Move uploaded file
            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $upload_path)) {
                $archivo_adjunto = $upload_path;
            } else {
                throw new Exception('Error al subir el archivo');
            }
        } else {
            throw new Exception('Error en la carga del archivo: ' . $_FILES['archivo']['error']);
        }
    }

    // Get database connection
    $conn = getDBConnection();

    // Prepare SQL statement
    $sql = "INSERT INTO tbl_objetivos (
                nombre, 
                descripcion, 
                id_departamento, 
                fecha_cumplimiento, 
                progreso, 
                estado, 
                ar, 
                archivo_adjunto, 
                id_creador
            ) VALUES (?, ?, ?, ?, 0, 'pendiente', ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param(
        "ssisssi",
        $nombre,
        $descripcion,
        $id_departamento,
        $fecha_cumplimiento,
        $ar,
        $archivo_adjunto,
        $id_creador
    );

    // Execute statement
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Objetivo creado exitosamente';
        $response['id_objetivo'] = $stmt->insert_id;
    } else {
        throw new Exception('Error al crear el objetivo: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    
    // Delete uploaded file if database insert failed
    if (isset($archivo_adjunto) && !empty($archivo_adjunto) && file_exists($archivo_adjunto)) {
        unlink($archivo_adjunto);
    }
}

echo json_encode($response);
?>