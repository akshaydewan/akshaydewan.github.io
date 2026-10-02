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
  const details = viewer.querySelector(".photo-viewer-exif");
  const detailsCache = new Map();
  const exifOptions = {
    length: "auto",
    expanded: true,
    includeOffsets: true,
    computed: true,
    includeTags: {
      file: ["FileType"],
      exif: [
        "Make", "Model", "LensMake", "LensModel", "LensSpecification",
        "ExposureTime", "FNumber", "ISOSpeedRatings", "ISOSpeed",
        "RecommendedExposureIndex", "StandardOutputSensitivity"
      ]
    }
  };
  let detailsRequest = 0;
  let currentIndex = 0;
  let opener = null;

  function tagText(tag) {
    return typeof tag?.description === "string" ? tag.description.trim() : "";
  }

  function tagNumber(tag) {
    const value = Array.isArray(tag?.computed) ? tag.computed[0] : tag?.computed;
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  }

  function equipmentName(make, model) {
    if (!model) return make;
    // Nikon, for example, writes "NIKON CORPORATION" and "NIKON D750".
    const brand = make.replace(/\s+(corporation|corp\.?|inc\.?|ltd\.?)$/i, "").toLowerCase();
    if (!brand || model.toLowerCase().includes(brand)) return model;
    return `${make} ${model}`;
  }

  function formatDetails(metadata) {
    const tags = metadata.exif || {};
    const camera = equipmentName(tagText(tags.Make), tagText(tags.Model));
    const lens = tagText(tags.LensModel) ||
      equipmentName(tagText(tags.LensMake), tagText(tags.LensSpecification));
    const exposure = tagNumber(tags.ExposureTime);
    const aperture = tagNumber(tags.FNumber);
    const iso = tagNumber(tags.ISOSpeed) || tagNumber(tags.ISOSpeedRatings) ||
      tagNumber(tags.RecommendedExposureIndex) || tagNumber(tags.StandardOutputSensitivity);
    const settings = [];

    if (exposure !== null) {
      const reciprocal = 1 / exposure;
      const denominator = Math.round(reciprocal);
      const shutter = exposure < 1 && Math.abs(reciprocal - denominator) / reciprocal < 0.01
        ? `1/${denominator}` : Number(exposure.toPrecision(3)).toString();
      settings.push(`${shutter} s`);
    }
    if (aperture !== null) settings.push(`f/${Number(aperture.toFixed(2))}`);
    if (iso !== null) settings.push(`ISO ${Math.round(iso)}`);

    const fields = [];
    if (camera) fields.push(`📷 ${camera}`);
    if (lens) fields.push(lens);
    fields.push(...settings);
    return fields.length ? [fields.join(" · ")] : [];
  }

  function readDetails(url) {
    if (!detailsCache.has(url)) {
      const pending = Promise.resolve()
        .then(() => window.ExifReader.load(url, exifOptions))
        .then((metadata) => {
          // WebP EXIF can follow the pixel data, beyond the initial range.
          // ExifReader 4.46.0 may consider its leading VP8X header complete.
          if (metadata.file?.FileType?.value === "webp" && !metadata.exif) {
            return window.ExifReader.load(url, { ...exifOptions, length: undefined });
          }
          return metadata;
        })
        .then(formatDetails)
        .catch((error) => {
          // Auto reading reports a valid WebP without metadata as unsupported
          // after reaching EOF. Cache that absence, while allowing other failures
          // (including network/CORS errors) to be retried.
          if (error.message?.startsWith('length: "auto" could not locate metadata in this file')) return [];
          throw error;
        });
      detailsCache.set(url, pending);
      // Failed reads can be retried; successful and metadata-free reads are cached.
      pending.catch(() => {
        if (detailsCache.get(url) === pending) detailsCache.delete(url);
      });
    }
    return detailsCache.get(url);
  }

  function clearDetails() {
    details.hidden = true;
    details.replaceChildren();
  }

  async function showDetails(url) {
    const request = ++detailsRequest;
    clearDetails();
    if (!window.ExifReader || typeof window.ExifReader.load !== "function") return;
    details.textContent = "Reading photo details…";
    details.hidden = false;

    try {
      const rows = await readDetails(url);
      if (request !== detailsRequest || !viewer.open) return;
      clearDetails();
      for (const text of rows) {
        const row = document.createElement("p");
        row.textContent = text;
        details.append(row);
      }
      details.hidden = rows.length === 0;
    } catch {
      if (request === detailsRequest && viewer.open) clearDetails();
    }
  }

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
    showDetails(original.src);
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
    // A native close event can arrive after the viewer has already reopened.
    if (viewer.open) return;
    ++detailsRequest;
    clearDetails();
    document.documentElement.classList.remove("photo-viewer-open");
    image.removeAttribute("src");
    if (opener) opener.focus({ preventScroll: true });
  });
})();
