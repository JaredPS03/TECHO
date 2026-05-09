<?php
// Archivo: upload.php
// Sube este archivo a la carpeta public_html de tu Hostinger.

// Permitir peticiones desde Vercel
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

// Clave secreta para que nadie más pueda subir imágenes a tu servidor
$secret = "mi_clave_super_secreta_123";

if (!isset($_POST['secret']) || $_POST['secret'] !== $secret) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado. Clave secreta incorrecta."]);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No se envió ningún archivo"]);
    exit;
}

$file = $_FILES['file'];
$uploadDir = 'uploads/'; // La carpeta donde se guardarán (se crea sola)

// Crear carpeta si no existe
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Validar que sea una imagen segura
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de archivo no permitido. Usa JPG, PNG o WEBP."]);
    exit;
}

// Crear un nombre único para evitar que se sobreescriban
$fileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destination = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Generar la URL completa hacia la imagen
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST'];
    $fileUrl = $protocol . "://" . $domain . "/" . $destination;
    
    echo json_encode(["url" => $fileUrl]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error interno al mover el archivo en Hostinger"]);
}
?>
