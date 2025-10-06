<?php
// URL of your query endpoint
$url = "https://dev01.expitrans.com/query"; // adjust if needed

// Your merchant credentials
$merchantName = "TWINOAKSPLACE";
$merchantKey  = "9860d2d9b6480116363d2cba5fa96b3625bdeff8";

// Build POST data for product query
$postData = [
    'action'        => 'expiproduct',   // correct action for products
    'x_login'       => $merchantName,
    'x_tran_key'    => $merchantKey,

    // Uncomment below if you want to fetch ONE product only:
    // 'x_product'     => 'PRODUCT_UNIQUE_ID',
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