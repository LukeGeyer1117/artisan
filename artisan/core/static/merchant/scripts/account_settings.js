const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Await the result of get_merchant_information
        const merchant_information = await get_merchant_information();

        // Now merchant_information is the resolved data
        document.getElementById('profile-display-name').innerHTML = merchant_information.full_name;
        document.getElementById('merchant-name').innerHTML = merchant_information.full_name;
        document.getElementById('merchant-email').innerHTML = merchant_information.email;
        document.getElementById('merchant-username').innerHTML = merchant_information.username;
        document.getElementById('merchant-phone').innerHTML = merchant_information.phone_number;

        // Update the profile image if available
        if (merchant_information.image) {
          console.log(merchant_information.image);
          const avatar = document.getElementById('profile-avatar');
          avatar.innerHTML = `<img src='/media/${merchant_information.image}'>`
        }

    } catch (error) {
        console.error('Error setting merchant information:', error);
    }
});

async function get_merchant_information() {
    return await fetch(`${API_BASE_URL}/artisan/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Could not get merchant info');
        return response.json();
    })
    .then(data => {
        console.log(data);
        return data.artisan;
    });
}

// Add the new function to handle profile image uploads
document.addEventListener('DOMContentLoaded', function() {
    const profileImageUpload = document.getElementById('profile-image-upload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (file) {
                // Display the new image preview immediately
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('user-profile-image').src = e.target.result;
                };
                reader.readAsDataURL(file);

                // Now upload the image to the server
                await upload_profile_image(file);
            }
        });
    }
});

async function upload_profile_image(file) {
    const formData = new FormData();
    formData.append('profile_image', file);

    try {
        const response = await fetch(`${API_BASE_URL}/artisan/upload_profile_image/`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to upload profile image.');
        }

        const data = await response.json();
        console.log('Image upload successful:', data);
        // You might want to update the image URL from the response
        if (data.profile_image_url) {
            document.getElementById('user-profile-image').src = data.profile_image_url;
        }

    } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('Failed to upload image. Please try again.');
    }
}