<?php
// api.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
// Load configuration
$config = require_once 'config.php';
$apiKey = $config['PERPLEXITY_API_KEY'];

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(["error" => "Server misconfiguration: API Key missing"]);
    exit();
}

if (!$input || !isset($input['messages'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid payload"]);
    exit();
}

$data = [
    "model" => $input['model'] ?? "sonar",
    "messages" => $input['messages']
];

$ch = curl_init("https://api.perplexity.ai/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
