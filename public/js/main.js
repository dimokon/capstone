const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
if (menuToggle)
  menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  });
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";
    button.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password",
    );
  });
});

const galleryModal = document.getElementById("galleryModal");
const galleryModalImage = document.getElementById("galleryModalImage");
const galleryModalTitle = document.getElementById("galleryModalTitle");
const galleryModalCategory = document.getElementById("galleryModalCategory");
const galleryCloseButton = document.querySelector(".gallery-modal-close");
const galleryBackdrop = document.querySelector("[data-close-gallery]");

function openGalleryModal(image, title, category) {
  if (
    !galleryModal ||
    !galleryModalImage ||
    !galleryModalTitle ||
    !galleryModalCategory
  )
    return;
  galleryModalImage.src = image;
  galleryModalImage.alt = title;
  galleryModalTitle.textContent = title;
  galleryModalCategory.textContent = category;
  galleryModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeGalleryModal() {
  if (!galleryModal) return;
  galleryModal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-gallery-image]").forEach((card) => {
  card.addEventListener("click", () => {
    openGalleryModal(
      card.dataset.galleryImage,
      card.dataset.galleryTitle,
      card.dataset.galleryCategory,
    );
  });
});

if (galleryCloseButton)
  galleryCloseButton.addEventListener("click", closeGalleryModal);
if (galleryBackdrop)
  galleryBackdrop.addEventListener("click", closeGalleryModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryModal && !galleryModal.hidden) {
    closeGalleryModal();
  }
});
