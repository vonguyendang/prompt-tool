<?php
// history.php - Handles server-side history storage
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$file = 'history.json';

// Ensure file exists
if (!file_exists($file)) {
    file_put_contents($file, '[]');
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Read history
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($method === 'POST') {
    // Save to history
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    $currentData = json_decode(file_get_contents($file), true) ?? [];

    // Check duplication based on Idea string or timestamp? 
    // Let's just prepend 
    array_unshift($currentData, $input);

    // Limit to latest 50 items to prevent file growth
    if (count($currentData) > 50) {
        $currentData = array_slice($currentData, 0, 50);
    }

    if (file_put_contents($file, json_encode($currentData, JSON_PRETTY_PRINT))) {
        echo json_encode(["success" => true, "history" => $currentData]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to write file"]);
    }
    exit;
}

if ($method === 'DELETE') {
    // Clear history
    if (file_put_contents($file, '[]')) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to clear file"]);
    }
    exit;
}
