import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";
import { get_merchant_information } from "./common.js";

const csrftoken = getCookie('csrftoken');
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
    // A single, coordinated function to set up the page
    await setup_account_settings();
    setup_event_listeners();
});

async function setup_account_settings() {
    try {
        const merchant_information = await get_merchant_information();

        if (merchant_information) {
            console.log(merchant_information);
            // Update all static fields with fetched data
            document.getElementById('profile-display-name').textContent = merchant_information.full_name;
            document.getElementById('merchant-name').textContent = merchant_information.full_name;
            document.getElementById('merchant-email').value = merchant_information.email;
            document.getElementById('merchant-contact-email').value = merchant_information.contact_email;
            document.getElementById('merchant-username').value = merchant_information.username;
            document.getElementById('merchant-phone').value = merchant_information.phone_number;
            document.getElementById('merchant-contact-phone').value = merchant_information.contact_phone;

            // Update social media fields if they exist
            if (document.getElementById('facebook-link')) {
                document.getElementById('facebook-link').value = merchant_information.facebook_link || '';
            }
            if (document.getElementById('youtube-link')) {
                document.getElementById('youtube-link').value = merchant_information.youtube_link || '';
            }
            if (document.getElementById('instagram-link')) {
                document.getElementById('instagram-link').value = merchant_information.instagram_link || '';
            }

            // Update the profile picture
            updateProfilePictureDisplay(merchant_information.image, merchant_information.full_name);
        }

    } catch (error) {
        console.error('Error setting merchant information:', error);
    }
}

function updateProfilePictureDisplay(imagePath, fullName) {
    const avatarContainer = document.querySelector('.profile-avatar');
    if (imagePath) {
        avatarContainer.innerHTML = `<img src="/media/${imagePath}" alt="${fullName}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    } else {
        // If no image, display initials
        const initials = fullName ? fullName.split(' ').map(n => n[0]).join('') : 'FN';
        avatarContainer.innerHTML = `<span id="profile-initials">${initials}</span>`;
    }
}

function setup_event_listeners() {
    // Set up the submit button listener
    const submitButton = document.getElementById('submit-account-change');
    if (submitButton) {
        submitButton.addEventListener('click', submit_account_changes);
    }

    // Create a hidden file input to programmatically trigger a file selection
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'profile-image-input';
    document.body.appendChild(fileInput);

    // Set up the "Upload Photo" button to trigger the hidden file input
    const uploadButton = document.getElementById('upload-pfp-btn');
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Listen for changes on the file input
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            // A visual preview can be added here before the upload is complete
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarContainer = document.getElementById('profile-avatar');
                avatarContainer.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            };
            reader.readAsDataURL(file);

            // Now, upload the file
            await upload_profile_image(file);
        }
    });

    // Set up the "Remove Photo" button
    const removeButton = document.querySelector('#remove-pfp-btn');
    if (removeButton) {
        removeButton.addEventListener('click', remove_profile_picture);
    }
}

async function submit_account_changes() {
    // This function will now only handle text-based changes.
    // Image changes are handled by the separate upload/remove functions.
    const changes = {};
    const originalInfo = await get_merchant_information();

    // Check for changes to account info
    const newContactEmail = document.getElementById("merchant-contact-email").value;
    if (newContactEmail !== (originalInfo.contact_email || '')) {
        changes.contact_email = newContactEmail;
    }

    const newContactPhone = document.getElementById('merchant-contact-phone').value;
    if (newContactEmail !== (originalInfo.contact_phone || '')) {
        changes.contact_phone = newContactPhone;
    }

    // Check for changes in social media links
    const newFacebookLink = document.getElementById('facebook-link').value;
    if (newFacebookLink !== (originalInfo.facebook_link || '')) {
        changes.facebook_link = newFacebookLink;
    }

    const newYoutubeLink = document.getElementById('youtube-link').value;
    if (newYoutubeLink !== (originalInfo.youtube_link || '')) {
        changes.youtube_link = newYoutubeLink;
    }

    const newInstagramLink = document.getElementById('instagram-link').value;
    if (newInstagramLink !== (originalInfo.instagram_link || '')) {
        changes.instagram_link = newInstagramLink;
    }

    // Only proceed with a fetch call if changes were made
    if (Object.keys(changes).length > 0) {
        try {
            const response = await fetch(`${API_BASE_URL}/artisan/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // Add CSRF token if needed
                },
                body: JSON.stringify(changes),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update account information.');
            }

            const data = await response.json();
            console.log('Account update successful:', data);
            showToast("Account Information Updated");

        } catch (error) {
            console.error('Error submitting changes:', error);
            alert('Failed to update information. Please try again.');
        }
    } else {
        alert('No changes to submit.');
    }
}

async function upload_profile_image(file) {
    // Validate the file parameter
    if (!file) {
        console.error('No file provided to upload_profile_image');
        alert('No file selected. Please choose an image to upload.');
        return;
    }

    console.log('File to upload:', file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('image', file);
    console.log(`FormData: ${formData}`);

    // Debug: Log FormData contents
    for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value);
    }

    try {
        console.log('Making request to:', `${API_BASE_URL}/artisan/upload_profile_image/`);
        console.log('Request method: POST');
        console.log('Request credentials: include');

        console.log(`csrftoken: ${csrftoken}`);
        
        const response = await fetch(`${API_BASE_URL}/artisan/pfp/`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload profile image.');
        }

        const data = await response.json();
        console.log('Image upload successful:', data);
        showToast("Profile Image Updated");
        
        // Use the returned URL to update the display immediately
        if (data.image_url) {
            const avatarContainer = document.getElementById('profile-avatar');
            const fullName = document.getElementById('profile-display-name').textContent;
            
            // Create a new image element and add it to the container
            avatarContainer.innerHTML = `<img src="${data.image_url}" alt="${fullName}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }

    } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('Failed to upload image. Please try again.');
    }
}

async function remove_profile_picture() {
    try {
        const response = await fetch(`${API_BASE_URL}/artisan/pfp/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove profile picture.');
        }

        console.log('Image removed successfully!');
        showToast("Profile Picture Removed");
        
        // Re-fetch information to update the display to show initials
        await setup_account_settings();

    } catch (error) {
        console.error('Error removing profile image:', error);
        alert('Failed to remove image. Please try again.');
    }
}