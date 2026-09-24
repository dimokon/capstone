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

document.querySelectorAll("[data-stream-select]").forEach((streamSelect) => {
  const gradeSelect = streamSelect
    .closest("form")
    ?.querySelector("select[name='classGrade']");
  if (!gradeSelect) return;
  const streams = JSON.parse(streamSelect.dataset.streams || "{}");
  const selectedStream = streamSelect.dataset.selected || "";
  const updateStreams = () => {
    streamSelect.innerHTML = '<option value="">Choose stream</option>';
    (streams[gradeSelect.value] || []).forEach((stream) => {
      const option = document.createElement("option");
      option.value = stream;
      option.textContent = stream;
      option.selected = stream === selectedStream;
      streamSelect.appendChild(option);
    });
  };
  gradeSelect.addEventListener("change", updateStreams);
  updateStreams();
});

document
  .querySelectorAll("[data-student-filter='grade']")
  .forEach((gradeFilter) => {
    const streamFilter = gradeFilter.parentElement.parentElement.querySelector(
      "[data-student-filter='stream']",
    );
    const studentSelect = gradeFilter
      .closest("form")
      .querySelector("select[name='studentId']");
    if (!streamFilter || !studentSelect) return;
    const streams = JSON.parse(streamFilter.dataset.streams || "{}");
    const updateStreamOptions = () => {
      streamFilter.innerHTML = '<option value="">All streams</option>';
      (
        streams[gradeFilter.value] ||
        Object.values(streams)
          .flat()
          .filter((stream, index, all) => all.indexOf(stream) === index)
      ).forEach((stream) => {
        const option = document.createElement("option");
        option.value = stream;
        option.textContent = stream;
        streamFilter.appendChild(option);
      });
    };
    const updateStudentOptions = () => {
      const grade = gradeFilter.value;
      const stream = streamFilter.value;
      Array.from(studentSelect.options).forEach((option, index) => {
        if (index === 0) return;
        option.hidden = Boolean(
          (grade && option.dataset.grade !== grade) ||
          (stream && option.dataset.stream !== stream),
        );
      });
      if (studentSelect.selectedOptions[0]?.hidden) studentSelect.value = "";
    };
    gradeFilter.addEventListener("change", () => {
      updateStreamOptions();
      updateStudentOptions();
    });
    streamFilter.addEventListener("change", updateStudentOptions);
    updateStreamOptions();
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
