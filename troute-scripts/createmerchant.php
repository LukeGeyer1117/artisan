<!-- CURRENTLY DOES NOT WORK -->

<?php
require __DIR__ . '/../vendor/autoload.php';

$url = 'https://develop.expitrans.com/query?action=create_merchant';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../artisan');
$dotenv->load();

// Credentials for the account creating the merchant
$adminEmail = getenv('TROUTE_EMAIL');
$adminPass  = getenv('TROUTE_PASS');

// Information for the merchant
$companyName  = $_POST['x_company_name']  ?? "Example Store";
$addressLine1 = $_POST['x_address1']      ?? "123 Main St";
$addressLine2 = $_POST['x_address2']      ?? '';
$city         = $_POST['x_city']          ?? 'New York City';
$state        = $_POST['x_state']         ?? 'NY';
$zip          = $_POST['x_zip']           ?? '00000';
$country      = $_POST['x_country']       ?? "US";
$phone        = $_POST['x_phone']         ?? "5555555555";
$fax          = $_POST['x_fax']           ?? "5555555556";
$email        = $_POST['x_email']         ?? "info@example.com";
$website      = $_POST['x_website']       ?? "https://www.example.com/";

// Billing Info
$billingBankName     = $_POST['x_billing_bank_name']      ?? "Example Bank";
$billingRoutingNum   = $_POST['x_billing_routing_number'] ?? "123456789";
$billingAccountNum   = $_POST['x_billing_account_number'] ?? "987654321";
$billingPhone        = $_POST['x_billing_phone']          ?? "5555555555";
$billingCountry      = $_POST['x_billing_country']        ?? "US";
$billingZip          = $_POST['x_billing_zip']            ?? "80202";
$billingState        = $_POST['x_billing_state']          ?? "CO";
$billingCity         = $_POST['x_billing_city']           ?? "Denver";
$billingAddress1     = $_POST['x_billing_address1']       ?? "123 Billing St";
$billingAddress2     = $_POST['x_billing_address2']       ?? "Floor 2";
$billingNotes        = $_POST['x_billing_notes']          ?? "Primary billing account";

// Contact information
$contactFirstName = $_POST['x_contact_first_name'] ?? "John";
$contactLastName  = $_POST['x_contact_last_name']  ?? "Doe";
$contactPhone     = $_POST['x_contact_phone']      ?? "5555555555";
$contactFax       = $_POST['x_contact_fax']        ?? "5555555556";
$contactEmail     = $_POST['x_contact_email']      ?? "john.doe@example.com";

// Merchant fields and surcharges
$merchantFields   = $_POST['x_merchant_fields']    ?? "CustomField1/CustomField2/CustomField3";
$defaultSurcharge = $_POST['x_default_surcharge']  ?? "flat";
$surchargeFlat    = $_POST['x_surcharge_flat']     ?? "0.30";
$surchargePercent = $_POST['x_surcharge_percent']  ?? "2.90";

$postData = [
  "x_login" => $adminEmail,
  "x_tran_key" => $adminPass,
  // Merchant info
  "x_company_name"    => $companyName,
  "x_address1"        => $addressLine1,
  "x_address2"        => $addressLine2,
  "x_city"            => $city,
  "x_state"           => $state,
  "x_zip"             => $zip,
  "x_country"         => $country,
  "x_phone"           => $phone,
  "x_fax"             => $fax,
  "x_email"           => $email,
  "x_website"         => $website,

  // Billing info
  "x_billing_bank_name"       => $billingBankName,
  "x_billing_routing_number"  => $billingRoutingNum,
  "x_billing_account_number"  => $billingAccountNum,
  "x_billing_phone"           => $billingPhone,
  "x_billing_country"         => $billingCountry,
  "x_billing_zip"             => $billingZip,
  "x_billing_state"           => $billingState,
  "x_billing_city"            => $billingCity,
  "x_billing_address1"        => $billingAddress1,
  "x_billing_address2"        => $billingAddress2,
  "x_billing_notes"           => $billingNotes,

  // Contact info
  "x_contact_first_name" => $contactFirstName,
  "x_contact_last_name"  => $contactLastName,
  "x_contact_phone"      => $contactPhone,
  "x_contact_fax"        => $contactFax,
  "x_contact_email"      => $contactEmail,

  // Merchant fields + surcharge
  "x_merchant_fields"    => $merchantFields,
  "x_default_surcharge"  => $defaultSurcharge,
  "x_surcharge_flat"     => $surchargeFlat,
  "x_surcharge_percent"  => $surchargePercent
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