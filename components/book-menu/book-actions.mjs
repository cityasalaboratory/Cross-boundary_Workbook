
function render({ el }) {
  const container = document.createElement("div");
  container.className = "book-actions";

  // ------------------------------------------
  // Styling (inside the widget)
  // ------------------------------------------
  const style = document.createElement("style");

  style.textContent = `
    .book-actions {
      position: relative;
      display: inline-block;
      font-family: system-ui, sans-serif;
      z-index: 100;
    }

    .book-actions-trigger {
      border: none;
      background: transparent;
      color: #002d2b;
      border-radius: 6px;
      padding: 0.5rem 0.8rem;
      font-size: 2rem;
      line-height: 1;
      cursor: pointer;
    }

    .book-actions-trigger:hover,
    .book-actions-dropdown button:hover {
      background: #e8f3f5;
    }

    .book-actions-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 260px;
      padding: 0.5rem;
      border: 1px solid #d6e7ed;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,.15);
      z-index: 1000;
    }

    .book-actions-dropdown[hidden] {
      display: none !important;
    }

    .book-actions-dropdown button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      border: none;
      background: transparent;
      color: #002d2b;
      padding: 0.9rem;
      text-align: left;
      font: 0.95rem system-ui, sans-serif;
      cursor: pointer;
      border-radius: 5px;
    }

    .book-actions-icon {
      width: 1.5rem;
      text-align: center;
      flex-shrink: 0;
    }

    .book-embed-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.42);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
      z-index: 99999;
    }

    .book-embed-overlay[hidden] {
      display: none !important;
    }

    .book-embed-dialog {
      width: min(700px, 94vw);
      max-height: 90vh;
      overflow-y: auto;
      background: #fff;
      color: #002d2b;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      padding: 2rem;
    }

    .book-embed-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .book-embed-heading h2 {
      margin: 0;
      font-size: 1.7rem;
      font-weight: 600;
    }

    .book-embed-close {
      border: none;
      background: transparent;
      font-size: 1.7rem;
      cursor: pointer;
      color: #002d2b;
    }

    .book-embed-label {
      display: block;
      margin-bottom: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .book-embed-code {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-height: 165px;
      resize: vertical;
      border: 1px solid #b8c9c9;
      border-radius: 5px;
      padding: 1rem;
      background: #f8fbfc;
      color: #263b3b;
      font: 0.9rem/1.6 monospace;
    }

    .book-embed-button {
      border: 1px solid #087f83;
      background: white;
      color: #006d70;
      border-radius: 5px;
      padding: 0.7rem 1.2rem;
      margin-top: 1rem;
      cursor: pointer;
      font: 500 0.95rem system-ui, sans-serif;
    }

    .book-embed-button:hover {
      background: #e8f3f5;
    }

    .book-embed-done {
      background: #008b8b;
      color: white;
    }

    .book-embed-done:hover {
      background: #006f70;
    }

    .book-embed-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      border-top: 1px solid #e3ebed;
      padding-top: 1rem;
    }

    .book-embed-status {
      font-size: 0.85rem;
      color: #006d70;
      min-height: 1.2rem;
      margin-top: 0.5rem;
    }

    .book-actions button:focus-visible,
    .book-embed-overlay button:focus-visible,
    .book-embed-code:focus-visible {
      outline: 2px solid #087ca0;
      outline-offset: 2px;
    }

    @media print {
      .book-actions,
      .book-embed-overlay {
        display: none !important;
      }
    }
  `;

  container.innerHTML = `
    <button class="book-actions-trigger"
            type="button"
            aria-label="Book actions"
            aria-expanded="false"
            aria-haspopup="true">
      &#8943;
    </button>

    <div class="book-actions-dropdown" hidden>
      <button type="button" data-action="print">
        <span class="book-actions-icon">⎙</span>
        Print preview
      </button>

      <button type="button" data-action="share">
        <span class="book-actions-icon">↗</span>
        Share
      </button>

      <button type="button" data-action="embed">
        <span class="book-actions-icon">&lt;/&gt;</span>
        Embed this book
      </button>

      <button type="button" data-action="report">
        <span class="book-actions-icon">⚑</span>
        Report abuse
      </button>
    </div>
  `;

  container.prepend(style);
  el.append(container);

  const trigger = container.querySelector(
    ".book-actions-trigger"
  );
  const dropdown = container.querySelector(
    ".book-actions-dropdown"
  );

  // ------------------------------------------
  // Embed modal
  // ------------------------------------------

  const overlay = document.createElement("div");
  overlay.className = "book-embed-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="book-embed-dialog"
         role="dialog"
         aria-modal="true"
         aria-label="Embed this book">

      <div class="book-embed-heading">
        <h2>Embed this book</h2>
        <button type="button"
                class="book-embed-close"
                aria-label="Close embed dialog">
          ×
        </button>
      </div>

      <label class="book-embed-label"
             for="city-book-embed-code">
        Embed code
      </label>

      <textarea
        id="city-book-embed-code"
        class="book-embed-code"
        readonly
      ></textarea>

      <button type="button"
              class="book-embed-button book-embed-copy">
        Copy
      </button>

      <div class="book-embed-status"
           role="status"
           aria-live="polite"></div>

      <div class="book-embed-footer">
        <button type="button"
                class="book-embed-button book-embed-done">
          Done
        </button>
      </div>
    </div>
  `;

  // Attach to the document body so the modal
  // isn't clipped by the JB2 navigation header.
  // The styles also need to exist in document scope.
  const globalStyle = style.cloneNode(true);
  document.head.append(globalStyle);
  document.body.append(overlay);

  const embedCode = overlay.querySelector(
    ".book-embed-code"
  );
  const embedStatus = overlay.querySelector(
    ".book-embed-status"
  );
  const closeButton = overlay.querySelector(
    ".book-embed-close"
  );
  const copyButton = overlay.querySelector(
    ".book-embed-copy"
  );
  const doneButton = overlay.querySelector(
    ".book-embed-done"
  );

  let previousFocus = null;

  // ------------------------------------------
  // Embed code generator
  // ------------------------------------------

  function generateEmbedCode() {
    // Current page URL. Once deployed, this
    // will be the public book's URL.
    const pageUrl = window.location.href
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");

    return `<iframe
  src="${pageUrl}"
  width="100%"
  height="500px"
  title="City As A Laboratory"
  loading="lazy"
></iframe>`;
  }

  function openEmbedDialog() {
    previousFocus = document.activeElement;
    embedCode.value = generateEmbedCode();
    embedStatus.textContent = "";
    overlay.hidden = false;
    closeButton.focus();
  }

  function closeEmbedDialog() {
    overlay.hidden = true;
    previousFocus?.focus?.();
  }

  // ------------------------------------------
  // Dropdown functions
  // ------------------------------------------

  function closeMenu() {
    dropdown.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu(event) {
    event.stopPropagation();
    dropdown.hidden = !dropdown.hidden;

    trigger.setAttribute(
      "aria-expanded",
      String(!dropdown.hidden)
    );
  }

  function handleOutsideClick(event) {
    if (!event.composedPath().includes(container)) {
      closeMenu();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      if (!overlay.hidden) {
        closeEmbedDialog();
      } else {
        closeMenu();
      }
    }
  }

  // ------------------------------------------
  // Copy embed code
  // ------------------------------------------

  async function copyEmbedCode() {
    try {
      await navigator.clipboard.writeText(
        embedCode.value
      );
      embedStatus.textContent =
        "Embed code copied to clipboard.";
    } catch (error) {
      embedCode.focus();
      embedCode.select();
      embedStatus.textContent =
        "Select and copy the embed code manually.";
    }
  }

  // ------------------------------------------
  // Menu actions
  // ------------------------------------------

  async function handleAction(event) {
    const button = event.target.closest(
      "[data-action]"
    );

    if (!button) return;

    const action = button.dataset.action;
    closeMenu();

    if (action === "print") {
      window.print();
    }

    if (action === "share") {
      const url = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url
          });
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Share failed:", error);
          }
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          alert("Page link copied.");
        } catch (error) {
          window.prompt("Copy this page URL:", url);
        }
      }
    }

    if (action === "embed") {
      openEmbedDialog();
    }

    if (action === "report") {
      const originalStoryMap =
        "https://storymaps.arcgis.com/stories/" +
        "784a6f6c670a408a84a9328bd1366ff8";

      const reportUrl =
        "https://survey123.arcgis.com/share/" +
        "bb92d520d12948e2974fa36160da2976" +
        "?field:storymap_url=" +
        encodeURIComponent(originalStoryMap);

      window.open(
        reportUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  // ------------------------------------------
  // Register events
  // ------------------------------------------

  trigger.addEventListener("click", toggleMenu);
  container.addEventListener("click", handleAction);

  document.addEventListener(
    "click",
    handleOutsideClick
  );
  document.addEventListener(
    "keydown",
    handleKeyDown
  );

  closeButton.addEventListener(
    "click",
    closeEmbedDialog
  );
  doneButton.addEventListener(
    "click",
    closeEmbedDialog
  );
  copyButton.addEventListener(
    "click",
    copyEmbedCode
  );

  function handleOverlayClick(event) {
    if (event.target === overlay) {
      closeEmbedDialog();
    }
  }

  overlay.addEventListener(
    "click",
    handleOverlayClick
  );

  // ------------------------------------------
  // Move menu beside JB2 Search
  // ------------------------------------------

  function moveMenuToHeader() {
    const searchButton = document.querySelector(
      "nav.myst-top-nav-bar button.myst-search-bar"
    );

    if (!searchButton) return;

    const existing = document.querySelector(
      "#city-book-header-actions"
    );

    if (existing && existing !== container) {
      existing.remove();
    }

    container.id = "city-book-header-actions";

    searchButton.parentElement.insertBefore(
      container,
      searchButton
    );

    container.style.marginRight = "12px";
    container.style.flexShrink = "0";
  }

  moveMenuToHeader();

  // ------------------------------------------
  // Cleanup
  // ------------------------------------------

  return () => {
    trigger.removeEventListener(
      "click",
      toggleMenu
    );
    container.removeEventListener(
      "click",
      handleAction
    );
    document.removeEventListener(
      "click",
      handleOutsideClick
    );
    document.removeEventListener(
      "keydown",
      handleKeyDown
    );
    closeButton.removeEventListener(
      "click",
      closeEmbedDialog
    );
    doneButton.removeEventListener(
      "click",
      closeEmbedDialog
    );
    copyButton.removeEventListener(
      "click",
      copyEmbedCode
    );
    overlay.removeEventListener(
      "click",
      handleOverlayClick
    );

    overlay.remove();
    globalStyle.remove();
    container.remove();
  };
}

export default { render };