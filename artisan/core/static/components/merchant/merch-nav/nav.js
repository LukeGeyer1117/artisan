import { get_merchant_information } from "../../../merchant/scripts/common.js";

document.addEventListener('DOMContentLoaded', async function () {
  const merchant_information = await get_merchant_information();
  console.log(merchant_information);

  const avatarContainer = document.querySelector('.navbar-pfp-container');

  if (merchant_information.image) {
    avatarContainer.innerHTML = `<img src="/media/${merchant_information.image}" alt="${merchant_information.full_name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  } else {
    const fullName = merchant_information.full_name;
    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('') : 'FN';
    avatarContainer.innerHTML = `<span id="profile-initials">${initials}</span>`;
  }
})