<?php
// URL of your query endpoint
$url = "https://develop.expitrans.com/query?action=expiproduct"; 

// Debug: show raw POST input
// echo "=== Incoming POST ===\n";
// print_r($_POST);

// Your merchant credentials (for Basic Auth)
$merchantLogin = $_POST['x_login'] ?? null;
$merchantKey   = $_POST['x_merchant_key'] ?? null;

// Product details from POST
$productUniqueID   = $_POST['x_product_uniqueID'] ?? null;
$productName       = $_POST['x_product_name'] ?? null;
$productDesc       = $_POST['x_product_description'] ?? null;
$productPrice      = $_POST['x_product_price'] ?? null;

// Debug: show parsed inputs
// echo "=== Parsed Inputs ===\n";
// echo "Login: $merchantLogin\n";
// echo "Key: $merchantKey\n";
// echo "UniqueID: $productUniqueID\n";
// echo "Name: $productName\n";
// echo "Description: $productDesc\n";
// echo "Price: $productPrice\n";

// Build JSON payload
$productData = [
    "product"    => [
        "uniqueID" => $productUniqueID,
        "name" => $productName,
        "description" => $productDesc, 
        "price" => $productPrice
    ]
];

$jsonData = json_encode($productData);

// // Debug: show payload being sent
// echo "=== Outgoing JSON Payload ===\n";
// echo $jsonData . "\n";

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/x-www-form-urlencoded',
    'Content-Length: ' . strlen($jsonData)
]);

// Basic Auth
curl_setopt($ch, CURLOPT_USERPWD, $merchantLogin . ":" . $merchantKey);

// Optional: disable SSL checks for dev/test only
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

// Execute request
$response = curl_exec($ch);

// Debug info
if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo $response . "\n";
}

curl_close($ch);
?>
