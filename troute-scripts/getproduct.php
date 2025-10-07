<?php
// Endpoint
$url = "https://develop.expitrans.com/query?action=expiproduct";

// Merchant credentials + uniqueID (these would usually come from POST or env)
$merchantKey = $_POST['x_login'] ?? "yourMerchantKey";
$secretKey   = $_POST['x_tran_key'] ?? "yourSecretKey";
$uniqueID    = $_POST['uniqueID'] ?? "123"; // example uniqueID

// Build request body as JSON
$requestData = [
    "x_login"   => $merchantKey,
    "x_tran_key"=> $secretKey,
    "uniqueID"  => $uniqueID
];
$jsonData = json_encode($requestData);

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");   // method GET
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);   // return response
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/x-www-form-urlencoded',
    'Content-Length: ' . strlen($jsonData)
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);  // attach JSON body even though GET

// Optional: disable SSL verification for dev
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

// Execute request
$response = curl_exec($ch);

// Debug
if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response:\n";
    echo $response . "\n";
}

curl_clo_
