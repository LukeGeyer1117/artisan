<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get form data
    $email = $_POST['email'] ?? '';
    $cardNumber = $_POST['cardNumber'] ?? '';
    $expiry = $_POST['expiry'] ?? '';
    $cvc = $_POST['cvc'] ?? '';
    $firstName = $_POST['firstName'] ?? '';
    $lastName = $_POST['lastName'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $state = $_POST['state'] ?? '';
    $zip = $_POST['zip'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $amount = $_POST['amount'] ?? '0.00';

    if (empty($cardNumber) || empty($expiry) || empty($cvc) || empty($firstName) || empty($lastName) || empty($email)) {
        throw new Exception('Required fields are missing');
    }

    $cardNumber = preg_replace('/\D/', '', $cardNumber);
    if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) throw new Exception('Invalid card number');
    if (!preg_match('/^\d{2}\/\d{2}$/', $expiry)) throw new Exception('Invalid expiry date format');
    $cvc = preg_replace('/\D/', '', $cvc);
    if (strlen($cvc) < 3 || strlen($cvc) > 4) throw new Exception('Invalid CVC');
    if (!is_numeric($amount) || floatval($amount) <= 0) throw new Exception('Invalid amount');

    $merchantName = 'TWINOAKSPLACE';
    $merchantKey  = '9860d2d9b6480116363d2cba5fa96b3625bdeff8';
    $transactUrl  = "https://develop.expitrans.com/transact/ANET";
    $customerUrl  = "https://develop.expitrans.com/query";

    // ---------------------------
    // Step 1: Process One-Time Payment
    // ---------------------------
    $postfields = [
        'x_login' => $merchantName,
        'x_tran_key' => $merchantKey,
        'x_version' => '3.1',
        'x_delim_data' => 'TRUE',
        'x_delim_char' => ',',
        'x_relay_response' => 'FALSE',
        'x_type' => 'AUTH_CAPTURE',
        'x_method' => 'CC',
        'x_card_num' => $cardNumber,
        'x_exp_date' => $expiry,
        'x_card_code' => $cvc,
        'x_amount' => number_format(floatval($amount), 2, '.', ''),
        'x_first_name' => trim($firstName),
        'x_last_name' => trim($lastName),
        'x_address' => trim($address),
        'x_city' => trim($city),
        'x_state' => trim($state),
        'x_zip' => trim($zip),
        'x_country' => 'USA',
        'x_phone' => preg_replace('/\D/', '', $phone),
        'x_email' => trim($email),
        'x_description' => 'Online Purchase',
        'x_invoice_num' => time() . rand(100, 999),
    ];

    $ch = curl_init($transactUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postfields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $paymentResponse = curl_exec($ch);
    curl_close($ch);

    $paymentFields = explode(',', $paymentResponse);
    $responseCode = $paymentFields[0] ?? '';
    $transactionId = $paymentFields[6] ?? '';
    $paymentSuccess = ($responseCode === '1');

    // Log payment result for debugging
    $paymentLog = [
        'success' => $paymentSuccess,
        'response_code' => $responseCode,
        'transaction_id' => $transactionId,
        'raw_response' => $paymentResponse
    ];
    file_put_contents('payment_debug.txt', json_encode($paymentLog) . "\n", FILE_APPEND | LOCK_EX);

    // ---------------------------
    // Step 2: Create Customer
    // ---------------------------
    $customerData = [
        'action'        => 'expicustomer',
        'x_login'       => $merchantName,
        'x_tran_key'    => $merchantKey,
        'x_forceadd'    => 1,
        'x_first_name'  => $firstName,
        'x_last_name'   => $lastName,
        'x_email'       => $email,
        'x_address1'    => $address,
        'x_city'        => $city,
        'x_state'       => $state,
        'x_zip'         => $zip,
        'x_country'     => 'US',
        'x_phone1'      => preg_replace('/\D/', '', $phone),
        'x_ccard_number'=> $cardNumber,
        'x_ccard_month' => (int)substr($expiry, 0, 2),
        'x_ccard_year'  => (int)substr($expiry, 3, 2)
    ];

    $ch = curl_init($customerUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($customerData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    $customerResponse = curl_exec($ch);
    curl_close($ch);

    $customerResult = json_decode($customerResponse, true);
    if (!$customerResult || !isset($customerResult['uniqueID'])) {
        throw new Exception("Customer creation failed: $customerResponse");
    }
    $customerId = $customerResult['uniqueID'];

    echo json_encode([
        'success' => $paymentSuccess,
        'transaction_id' => $transactionId,
        'customer_id' => $customerId,
        'payment_response' => $paymentResponse,
        'customer_response' => $customerResponse
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
