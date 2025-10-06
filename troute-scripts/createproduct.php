<?php
// URL of your query endpoint
$url = "https://develop.expitrans.com/query"; // adjust if needed

// Your merchant credentials
$merchantName = "TWINOAKSPLACE";
$merchantKey  = "9860d2d9b6480116363d2cba5fa96b3625bdeff8";

// Product details from POST request (fallback to defaults if missing)
$productName        = $_POST['x_product_name'] ?? "My New Product";
$productDescription = $_POST['x_product_description'] ?? "Description of my new product";
$productPrice       = $_POST['x_product_price'] ?? "29.99";

// Log to terminal (stderr, so it shows in PHP server console)
error_log("Product Name: " . $productName);
error_log("Product Description: " . $productDescription);
error_log("Product Price: " . $productPrice);


// Build POST data for creating a product
$postData = [
    'action'               => 'create_product',  // correct action for creating a product
    'x_login'              => $merchantName,
    'x_tran_key'           => $merchantKey,
    'x_product_name'       => $productName,
    'x_product_description'=> $productDescription,
    'x_product_price'      => $productPrice
];

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
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
