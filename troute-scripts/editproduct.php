<?php
// URL of your query endpoint
$url = "https://develop.expitrans.com/query?action=expiproduct"; // adjust if needed

// Your merchant credentials
$merchantLogin = $_POST['x_login'];
$merchantKey   = $_POST['x_merchant_key'];

// Product details from POST (the fields you want to update)
$productUniqueID   = $_POST['x_product_uniqueID'] ?? null;
$productName       = $_POST['x_product_name'] ?? null;
$productDesc       = $_POST['x_product_description'] ?? null;
$productPrice      = $_POST['x_product_price'] ?? null;

// Build JSON data
$productData = [
    "x_login"   => $merchantLogin,
    "x_tran_key"=> $merchantKey,
    "product"   => [
        "uniqueID"   => $productUniqueID
    ]
];

// Only include fields that were provided
if ($productName !== null) {
    $productData["product"]["name"] = $productName;
}
if ($productDesc !== null) {
    $productData["product"]["description"] = $productDesc;
}
if ($productPrice !== null) {
    $productData["product"]["price"] = $productPrice;
}

// Encode to JSON
$jsonData = json_encode($productData);

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

// Optional: for dev/test with self-signed certs
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

// Execute request
$response = curl_exec($ch);

// Debug info
if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response:\n";
    echo $response . "\n";
}

curl_close($ch);
?>
