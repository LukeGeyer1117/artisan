<?php

// URL of query endpoint
$baseURL = "https://develop.expitrans.com";
$url = $baseURL . "/query?action=expiproduct";

// Merchant Credentials
$merchantKey = $_POST['x_login'] ?? '';
$secretKey   = $_POST['x_merchant_key'] ?? '';
$uniqueID    = $_POST['uniqueID'] ?? '';

if (!$merchantKey || !$secretKey || !$uniqueID) {
    die("Error: merchantKey, secretKey, and uniqueID are required.\n");
}

// Build JSON body
$data = [
    "uniqueID"   => $uniqueID
];

$jsonData = json_encode($data);

// Initialize cURL
$ch = curl_init($url);

// DELETE request
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
$token = $merchantKey.":".$secretKey;
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: application/x-www-form-urlencoded",
    "Authorization: Basic ".$token
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response:\n";
    echo $response . "\n";
}

curl_close($ch);
?>
