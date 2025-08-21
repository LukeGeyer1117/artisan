const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  let changed = false;

  const text_content = await get_text_content();
  const sentence = document.getElementById('hero-sentence-draw');
  const header = document.getElementById('hero-header-draw');
  fill_text_fields(text_content, sentence, header);

  // Listen for text to be input
  sentence.addEventListener('change', function () {
    changed = true;
  });
  header.addEventListener('change', function () {
    changed = true;
  });

  const submit = document.getElementById('submit-text-change');
  submit.addEventListener('click', function () {
    if (changed) {
      update_text_content(sentence, header);
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

async function update_text_content(sentence, header) {
  try {
    const response = await fetch(`${API_BASE_URL}/edit/text/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        header: header.value,
        sentence: sentence.value
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

function fill_text_fields(text_content, sentence, header) {
  sentence.value = text_content.hero_sentence_draw;
  header.value = text_content.hero_header_draw;
}