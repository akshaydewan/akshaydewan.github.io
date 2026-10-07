(() => {
  const gallery = document.querySelector(".photos-grid");
  if (!gallery) return;
  const photos = Array.from(gallery.querySelectorAll(".photo"));
  const narrowScreen = window.matchMedia("(max-width: 800px)");
  const gap = 24;
  let pendingFrame = null;

  function arrangePhotos() {
    pendingFrame = null;
    gallery.classList.add("is-masonry");
    const columns = narrowScreen.matches ? 1 : 2;
    const width = gallery.getBoundingClientRect().width;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);
    // Read every height before positioning to account for image loading
    // without changing DOM or keyboard/navigation order.
    const photoHeights = photos.map((photo) => photo.getBoundingClientRect().height);
    photos.forEach((photo, index) => {
      const column = columns === 1 || heights[0] <= heights[1] ? 0 : 1;
      photo.style.transform = `translate(${column * (columnWidth + gap)}px, ${heights[column]}px)`;
      heights[column] += photoHeights[index] + gap;
    });
    gallery.style.height = `${Math.max(0, ...heights) - (photos.length ? gap : 0)}px`;
  }

  function scheduleLayout() {
    if (pendingFrame === null) pendingFrame = requestAnimationFrame(arrangePhotos);
  }

  arrangePhotos();
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(scheduleLayout);
    photos.forEach((photo) => observer.observe(photo));
  }
  window.addEventListener("resize", scheduleLayout);
  photos.forEach((photo) => {
    const image = photo.querySelector("img");
    image.addEventListener("load", scheduleLayout);
    image.addEventListener("error", scheduleLayout);
  });
  document.fonts?.ready.then(scheduleLayout);
})();

(() => {
  const viewer = document.querySelector("#photo-viewer");
  const links = Array.from(document.querySelectorAll(".photo-link"));

  // Keep the original image links working without modal-dialog support.
  if (!viewer || !links.length || typeof viewer.showModal !== "function") return;

  const image = viewer.querySelector(".photo-viewer-image");
  const imageArea = viewer.querySelector(".photo-viewer-image-area");
  const zoomTarget = viewer.querySelector(".photo-viewer-zoom");
  const mouseZoom = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const caption = viewer.querySelector(".photo-viewer-caption");
  const counter = viewer.querySelector(".photo-viewer-counter");
  const status = viewer.querySelector(".photo-viewer-status");
  const previous = viewer.querySelector(".photo-viewer-previous");
  const next = viewer.querySelector(".photo-viewer-next");
  const close = viewer.querySelector(".photo-viewer-close");
  const info = viewer.querySelector(".photo-viewer-info");
  const detailsDialog = viewer.querySelector(".photo-details-dialog");
  const detailsClose = viewer.querySelector(".photo-details-close");
  const loadingTemplate = viewer.querySelector("#photo-details-loading");
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
  let readerPromise = null;
  let detailsCloseTimer = null;
  let currentIndex = 0;
  let opener = null;
  let swipeStart = null;
  let wheelDistance = 0;
  let lastWheelEvent = 0;
  let lastWheelNavigation = -Infinity;
  let zoomed = false;
  let zoomFrame = null;
  let panPosition = { x: 0.5, y: 0.5 };
  let lastPointerType = "mouse";

  function arrangeZoom() {
    const bounds = imageArea.getBoundingClientRect();
    const ready = viewer.open && !image.hidden && image.complete &&
      image.naturalWidth > 0 && image.naturalHeight > 0 && bounds.width > 0 && bounds.height > 0;
    const fitScale = ready ? Math.min(1, bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight) : 1;
    const canZoom = ready && mouseZoom.matches && fitScale < 1;
    if (!canZoom) zoomed = false;
    zoomTarget.classList.toggle("can-zoom", canZoom);
    zoomTarget.classList.toggle("is-zoomed", zoomed);
    zoomTarget.tabIndex = canZoom ? 0 : -1;
    if (canZoom) {
      zoomTarget.setAttribute("role", "button");
      zoomTarget.setAttribute("aria-pressed", String(zoomed));
      zoomTarget.setAttribute("aria-label", `${zoomed ? "Fit photo to screen" : "Zoom photo to actual size"}: ${image.alt}`);
    } else {
      for (const attribute of ["role", "aria-pressed", "aria-label"]) zoomTarget.removeAttribute(attribute);
    }
    if (!ready) return;
    const scale = zoomed ? 1 : fitScale;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    // On an overflowing axis, the pointer's position maps to the full pan
    // range. Smaller axes stay centred instead of exposing extra empty space.
    const x = zoomed && width > bounds.width ? -(width - bounds.width) * panPosition.x : (bounds.width - width) / 2;
    const y = zoomed && height > bounds.height ? -(height - bounds.height) * panPosition.y : (bounds.height - height) / 2;
    zoomTarget.style.width = `${width}px`;
    zoomTarget.style.height = `${height}px`;
    zoomTarget.style.transform = `translate(${x}px, ${y}px)`;
  }

  function scheduleZoom() {
    if (zoomFrame === null) zoomFrame = requestAnimationFrame(() => {
      zoomFrame = null;
      arrangeZoom();
    });
  }

  function resetZoom() {
    zoomed = false;
    panPosition = { x: 0.5, y: 0.5 };
    zoomTarget.style.removeProperty("width");
    zoomTarget.style.removeProperty("height");
    zoomTarget.style.removeProperty("transform");
    arrangeZoom();
  }

  function trackPan(event) {
    const bounds = imageArea.getBoundingClientRect();
    panPosition = {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    };
  }

  function toggleZoom(event) {
    if (!zoomTarget.classList.contains("can-zoom")) return;
    if (event) trackPan(event);
    zoomed = !zoomed;
    arrangeZoom();
  }

  zoomTarget.addEventListener("pointerdown", (event) => { lastPointerType = event.pointerType; });
  zoomTarget.addEventListener("click", (event) => {
    if (event.button !== 0 || (event.pointerType || lastPointerType) !== "mouse") return;
    toggleZoom(event);
  });
  zoomTarget.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !event.repeat &&
        !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      toggleZoom();
    }
  });
  imageArea.addEventListener("pointermove", (event) => {
    if (!zoomed || event.pointerType !== "mouse" || event.target.closest("button")) return;
    trackPan(event);
    scheduleZoom();
  });
  if (typeof ResizeObserver === "function") new ResizeObserver(scheduleZoom).observe(imageArea);
  window.addEventListener("resize", scheduleZoom);
  mouseZoom.addEventListener("change", scheduleZoom);
  viewer.addEventListener("transitionend", scheduleZoom);

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
    const fields = [];
    if (camera) fields.push({ icon: "camera", label: "Camera", value: camera });
    if (lens) fields.push({ icon: "lens", label: "Lens", value: lens });

    if (exposure !== null) {
      const reciprocal = 1 / exposure;
      const denominator = Math.round(reciprocal);
      const shutter = exposure < 1 && Math.abs(reciprocal - denominator) / reciprocal < 0.01
        ? `1/${denominator}` : Number(exposure.toPrecision(3)).toString();
      fields.push({ icon: "shutter", label: "Shutter speed", value: `${shutter} s` });
    }
    if (aperture !== null) fields.push({ icon: "aperture", label: "Aperture", value: `f/${Number(aperture.toFixed(2))}` });
    if (iso !== null) fields.push({ icon: "iso", label: "ISO", value: String(Math.round(iso)) });
    return fields;
  }

  function loadExifReader() {
    if (typeof window.ExifReader?.load === "function") return Promise.resolve(window.ExifReader);
    if (!readerPromise) {
      readerPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = viewer.dataset.exifReaderSrc;
        script.onload = () => {
          if (typeof window.ExifReader?.load === "function") resolve(window.ExifReader);
          else {
            script.remove();
            reject(new Error("Photo metadata reader unavailable."));
          }
        };
        script.onerror = () => {
          script.remove();
          reject(new Error("Could not load photo metadata reader."));
        };
        document.head.append(script);
      }).catch((error) => {
        readerPromise = null;
        throw error;
      });
    }
    return readerPromise;
  }

  function readDetails(url) {
    if (!detailsCache.has(url)) {
      const pending = Promise.resolve()
        .then(loadExifReader)
        .then((reader) => reader.load(url, exifOptions))
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

  function createIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "photo-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#photo-icon-${name}`);
    svg.append(use);
    return svg;
  }

  function finishHidingDetails(restoreFocus) {
    clearTimeout(detailsCloseTimer);
    detailsCloseTimer = null;
    if (detailsDialog.open) detailsDialog.close();
    detailsDialog.classList.remove("is-closing");
    details.hidden = true;
    details.removeAttribute("aria-busy");
    details.replaceChildren();
    if (restoreFocus && viewer.open) info.focus({ preventScroll: true });
  }

  function hideDetails({ animate = false, restoreFocus = false } = {}) {
    ++detailsRequest;
    info.setAttribute("aria-expanded", "false");
    info.setAttribute("aria-label", "Show photo details");
    viewer.classList.remove("has-photo-details");
    scheduleZoom();
    clearTimeout(detailsCloseTimer);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (animate && detailsDialog.open && !reducedMotion) {
      detailsDialog.classList.add("is-closing");
      detailsCloseTimer = setTimeout(() => finishHidingDetails(restoreFocus), 240);
    } else finishHidingDetails(restoreFocus);
  }

  async function showDetails(url) {
    const request = ++detailsRequest;
    clearTimeout(detailsCloseTimer);
    detailsCloseTimer = null;
    detailsDialog.classList.remove("is-closing");
    info.setAttribute("aria-expanded", "true");
    info.setAttribute("aria-label", "Hide photo details");
    details.replaceChildren(loadingTemplate.content.cloneNode(true));
    details.hidden = false;
    details.setAttribute("aria-busy", "true");
    viewer.classList.add("has-photo-details");
    scheduleZoom();
    // Keep the photo controls interactive inside the outer modal.
    if (!detailsDialog.open) detailsDialog.show();

    try {
      const rows = await readDetails(url);
      if (request !== detailsRequest || !viewer.open || !detailsDialog.open) return;
      details.replaceChildren();
      details.removeAttribute("aria-busy");
      const list = document.createElement("dl");
      list.className = "photo-details-list";
      for (const { icon, label, value } of rows) {
        const row = document.createElement("div");
        row.className = "photo-details-row";
        const term = document.createElement("dt");
        term.append(createIcon(icon), document.createTextNode(label));
        const description = document.createElement("dd");
        description.textContent = value;
        row.append(term, description);
        list.append(row);
      }
      if (rows.length) details.append(list);
      else details.textContent = "No EXIF details available.";
    } catch {
      if (request !== detailsRequest || !viewer.open || !detailsDialog.open) return;
      details.removeAttribute("aria-busy");
      details.textContent = "Could not load photo details.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "photo-viewer-retry";
      retry.append(createIcon("retry"), document.createTextNode("Retry"));
      retry.addEventListener("click", () => {
        detailsClose.focus();
        showDetails(url);
      });
      details.append(document.createElement("br"), retry);
    }
  }

  function showPhoto(index) {
    if (index < 0 || index >= links.length) return;
    const keepDetailsOpen = info.getAttribute("aria-expanded") === "true";
    if (!keepDetailsOpen) hideDetails();
    currentIndex = index;
    const original = links[index].querySelector("img");

    image.hidden = true;
    resetZoom();
    status.textContent = "Loading photo…";
    status.hidden = false;
    image.alt = original.alt;
    for (const attribute of ["width", "height"]) {
      const value = original.getAttribute(attribute);
      if (value) image.setAttribute(attribute, value);
      else image.removeAttribute(attribute);
    }
    caption.textContent = original.alt;
    counter.textContent = `${index + 1} / ${links.length}`;
    previous.disabled = index === 0;
    next.disabled = index === links.length - 1;
    previous.hidden = next.hidden = links.length === 1;
    if ((document.activeElement === previous && previous.disabled) ||
        (document.activeElement === next && next.disabled)) {
      close.focus();
    }
    image.crossOrigin = "anonymous";
    image.src = original.src;
    if (keepDetailsOpen) showDetails(original.src);
  }

  image.addEventListener("load", () => {
    image.hidden = false;
    status.hidden = true;
    arrangeZoom();
  });

  image.addEventListener("error", () => {
    image.hidden = true;
    resetZoom();
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
  close.addEventListener("click", () => {
    hideDetails();
    viewer.close();
  });
  info.addEventListener("click", () => {
    if (!viewer.open) return;
    if (info.getAttribute("aria-expanded") === "true") hideDetails({ animate: true, restoreFocus: true });
    else showDetails(links[currentIndex].querySelector("img").src);
  });
  detailsClose.addEventListener("click", () => hideDetails({ animate: true, restoreFocus: true }));
  detailsDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    hideDetails({ animate: true, restoreFocus: true });
  });
  detailsDialog.addEventListener("close", () => {
    if (!detailsDialog.open) hideDetails({ restoreFocus: viewer.open });
  });

  viewer.addEventListener("keydown", (event) => {
    if (!viewer.open || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape" && detailsDialog.open) {
      event.preventDefault();
      hideDetails({ animate: true, restoreFocus: true });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    }
  });

  viewer.addEventListener("cancel", (event) => {
    if (detailsDialog.open) {
      event.preventDefault();
      hideDetails({ animate: true, restoreFocus: true });
    }
  });

  imageArea.addEventListener("wheel", (event) => {
    if (!viewer.open || event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelEvent > 150) wheelDistance = 0;
    lastWheelEvent = now;
    if (now - lastWheelNavigation < 450) return;
    const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? imageArea.clientWidth : 1;
    wheelDistance += event.deltaX * units;
    if (Math.abs(wheelDistance) >= 60) {
      showPhoto(currentIndex + (wheelDistance > 0 ? 1 : -1));
      wheelDistance = 0;
      lastWheelNavigation = now;
    }
  }, { passive: false });

  imageArea.addEventListener("pointerdown", (event) => {
    if (!viewer.open || event.pointerType === "mouse" || !event.isPrimary ||
        event.target.closest("button")) return;
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    imageArea.setPointerCapture(event.pointerId);
  });
  imageArea.addEventListener("pointerup", (event) => {
    if (!swipeStart || swipeStart.id !== event.pointerId) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (viewer.open && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      showPhoto(currentIndex + (dx < 0 ? 1 : -1));
    }
  });
  imageArea.addEventListener("pointercancel", () => { swipeStart = null; });

  // The outer native dialog keeps keyboard focus inside the viewer.
  viewer.addEventListener("close", () => {
    // A native close event can arrive after the viewer has already reopened.
    if (viewer.open) return;
    hideDetails();
    swipeStart = null;
    wheelDistance = 0;
    lastWheelNavigation = -Infinity;
    document.documentElement.classList.remove("photo-viewer-open");
    image.removeAttribute("src");
    resetZoom();
    if (opener) opener.focus({ preventScroll: true });
  });
})();
