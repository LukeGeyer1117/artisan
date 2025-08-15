const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  let changed = false;

  const text_content = await get_text_content();
  const sentence = document.getElementById('hero-sentence-draw');
  const header = document.getElementById('hero-header-draw');
  fill_text_fields(text_content, sentence, header);

  // Listen for text to be input
  sentence.addEventListener('change', set_change_active);
  header.addEventListener('change', set_change_active);
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

function set_change_active() {}

function update_text_content() {}

function fill_text_fields(text_content, sentence, header) {
  sentence.value = text_content.hero_sentence_draw;
  header.value = text_content.hero_header_draw;
}