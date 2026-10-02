(() => {
  const viewer = document.querySelector("#photo-viewer");
  const links = Array.from(document.querySelectorAll(".photo-link"));

  // Keep the original image links working without modal-dialog support.
  if (!viewer || !links.length || typeof viewer.showModal !== "function") return;

  const image = viewer.querySelector(".photo-viewer-image");
  const caption = viewer.querySelector(".photo-viewer-caption");
  const counter = viewer.querySelector(".photo-viewer-counter");
  const status = viewer.querySelector(".photo-viewer-status");
  const previous = viewer.querySelector(".photo-viewer-previous");
  const next = viewer.querySelector(".photo-viewer-next");
  const close = viewer.querySelector(".photo-viewer-close");
  let currentIndex = 0;
  let opener = null;

  function showPhoto(index) {
    if (index < 0 || index >= links.length) return;
    currentIndex = index;
    const original = links[index].querySelector("img");

    image.hidden = true;
    status.textContent = "Loading photo…";
    status.hidden = false;
    image.alt = original.alt;
    for (const attribute of ["width", "height"]) {
      const value = original.getAttribute(attribute);
      if (value) image.setAttribute(attribute, value);
      else image.removeAttribute(attribute);
    }
    caption.textContent = links[index].closest("figure").querySelector("figcaption").textContent;
    counter.textContent = `${index + 1} / ${links.length}`;
    previous.disabled = index === 0;
    next.disabled = index === links.length - 1;
    previous.hidden = next.hidden = links.length === 1;
    if ((document.activeElement === previous && previous.disabled) ||
        (document.activeElement === next && next.disabled)) {
      close.focus();
    }
    image.src = original.src;
  }

  image.addEventListener("load", () => {
    image.hidden = false;
    status.hidden = true;
  });

  image.addEventListener("error", () => {
    image.hidden = true;
    status.textContent = "Could not load this photo.";
    status.hidden = false;
  });

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      showPhoto(index);
      document.documentElement.classList.add("photo-viewer-open");
      if (!viewer.open) viewer.showModal();
    });
  });

  previous.addEventListener("click", () => showPhoto(currentIndex - 1));
  next.addEventListener("click", () => showPhoto(currentIndex + 1));
  close.addEventListener("click", () => viewer.close());

  viewer.addEventListener("keydown", (event) => {
    if (!viewer.open || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    }
  });

  // Native dialogs handle Escape and keep keyboard focus inside the viewer.
  viewer.addEventListener("close", () => {
    document.documentElement.classList.remove("photo-viewer-open");
    image.removeAttribute("src");
    if (opener) opener.focus({ preventScroll: true });
  });
})();
