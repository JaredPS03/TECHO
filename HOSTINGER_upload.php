<?php
// Archivo: upload.php
// Sube este archivo a la carpeta public_html de tu Hostinger.

// Permitir peticiones desde Vercel
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

// Clave secreta para que nadie más pueda subir imágenes a tu servidor
$secret = "mi_clave_super_secreta_123";

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['secret']) || $data['secret'] !== $secret) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado. Clave secreta incorrecta."]);
    exit;
}

if (!isset($data['fileBase64']) || !isset($data['fileName'])) {
    http_response_code(400);
    echo json_encode(["error" => "No se envió ningún archivo"]);
    exit;
}

$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Extraer info de base64
$fileData = base64_decode($data['fileBase64']);
$ext = strtolower(pathinfo($data['fileName'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de archivo no permitido. Usa JPG, PNG o WEBP."]);
    exit;
}

$fileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destination = $uploadDir . $fileName;

if (file_put_contents($destination, $fileData)) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST'];
    $fileUrl = $protocol . "://" . $domain . "/" . $destination;
    
    echo json_encode(["url" => $fileUrl]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error interno al guardar archivo"]);
}
?>
