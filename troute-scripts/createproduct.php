<?php
// URL of your query endpoint
$url = "https://develop.expitrans.com/query?action=expiproduct"; // adjust if needed

// Your merchant credentials
$merchantName = $_POST['x_login'];
$merchantKey  = $_POST['x_merchant_key'];

// Product details from POST request (fallback to defaults if missing)
$productName        = $_POST['x_product_name'] ?? "My New Product";
$productDescription = $_POST['x_product_description'] ?? "Description of my new product";
$productPrice       = $_POST['x_product_price'] ?? "29.99";


// Build POST data for creating a product
$postData = [
    "product" => [
        "uniqueID" => null,
        "name" => $productName,
        "description" => $productDescription,
        "price" => $productPrice
    ]
    ];

// Initialize cURL
$token = base64_encode($merchantName.":".$merchantKey);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Authorization: Basic '.$token
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
