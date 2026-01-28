import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  let changed = false;

  const text_content = await get_text_content();
  console.log(text_content);
  const sentence = document.getElementById('hero-sentence-draw');
  const header = document.getElementById('hero-header-draw');
  const featured_header = document.getElementById('featured-header');
  const featured_text = document.getElementById('featured-text');
  const gallery_subtext = document.getElementById('gallery-subtext');
  const custom_order_prompt = document.getElementById('custom-order-prompt');
  const project_description_placeholder = document.getElementById('project-description-placeholder');
  fill_text_fields(text_content, sentence, header, featured_header, featured_text, gallery_subtext, custom_order_prompt, project_description_placeholder);

  document.querySelectorAll('.text-content-input').forEach(input => {
    input.addEventListener('input', function () {
      changed = true;
    })
  })

  const submit = document.getElementById('submit-text-change');
  submit.addEventListener('click', function () {
    if (changed) {
      update_text_content(sentence, header, featured_header, featured_text, gallery_subtext, custom_order_prompt, project_description_placeholder);
    }
  })
});

async function get_text_content() {
  return await fetch(`${API_BASE_URL}/text/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get TextContent");
    return response.json();
  })
  .then(data => {
    return data.text_content;
  })
}

async function update_text_content(sentence, header, featured_header, featured_text, gallery_subtext, custom_order_prompt, project_description_placeholder) {
  try {
    const response = await fetch(`${API_BASE_URL}/text/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({
        header: header.value,
        sentence: sentence.value, 
        featured_header: featured_header.value,
        featured_text: featured_text.value,
        gallery_subtext: gallery_subtext.value,
        custom_order_prompt: custom_order_prompt.value,
        project_description_placeholder: project_description_placeholder.value
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update text content.');
    }

    const data = await response.json();
    window.location.reload();
    // Optional: Add UI feedback here, like a success message
    // showSuccessMessage('Text content updated successfully!');

  } catch (error) {
    console.error('An error occurred:', error.message);
    // Optional: Add UI feedback here, like an error message
    // showErrorMessage(error.message);
  }
}

function fill_text_fields(text_content, sentence, header, featured_header, featured_text, gallery_subtext, custom_order_prompt, project_description_placeholder) {
  sentence.value = text_content.hero_sentence_draw;
  header.value = text_content.hero_header_draw;
  featured_header.value = text_content.featured_header;
  featured_text.value = text_content.featured_text;
  gallery_subtext.value = text_content.gallery_subtext;
  custom_order_prompt.value = text_content.custom_order_prompt;
  project_description_placeholder.value = text_content.project_description_placeholder;
}