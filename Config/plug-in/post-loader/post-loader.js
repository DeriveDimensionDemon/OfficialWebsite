(() => {
    const root = document.getElementById("post-loader");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        root.textContent = "Post ID not found.";
        return;
    }

    const textPath = `Codex-Text/${encodeURIComponent(id)}.json`;

    fetch(textPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`JSON not found: ${textPath}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.id !== id) {
                throw new Error(
                    `ID mismatch: ${data.id || "(missing)"} !== ${id}`
                );
            }

            renderPost(data);
        })
        .catch(error => {
            root.textContent = error.message;
        });

    function renderPost(data) {
        const catalog = root.querySelector(".post-catalog.post");
        const images = root.querySelector(".post-images.post");
        const date = root.querySelector(".post-date.post");
        const title = root.querySelector(".post-title.post");
        const content = root.querySelector(".post-text.post");
        const tag = root.querySelector(".post-tag.post");

        if (!catalog || !images || !date || !title || !content || !tag) {
            throw new Error("Post Loader DOM structure is incomplete.");
        }

        document.title = data.title
            ? `${data.title} | Derive Dimension Demon`
            : "Derive Dimension Demon Official Website";

        renderCatalog(catalog, data.catalog);
        renderImages(images, id);
        renderText(date, data.date || "");
        renderTitle(title, data.title || "");
        renderContent(content, data.content || "");
        renderTags(tag, data.tag);
    }

    function renderCatalog(container, value) {
    const wrapper = container.querySelector("span");
    if (!wrapper) return;

    wrapper.textContent = "";

    // 固定第一層：Home
    const homeLink = document.createElement("a");
    homeLink.className = "post-catalog-link post";
    homeLink.textContent = "⛚ Home";
    homeLink.href = "index.html";
    wrapper.appendChild(homeLink);

    wrapper.appendChild(document.createTextNode(" "));

    // 固定第二層：Codex
    const codexLink = document.createElement("a");
    codexLink.className = "post-catalog-link post";
    codexLink.textContent = "⛞ Codex";
    codexLink.href = "Codex.html";
    wrapper.appendChild(codexLink);

    // JSON Catalog：從第三層開始
    const path = Array.isArray(value)
        ? value.filter(Boolean).map(String)
        : String(value || "")
            .split("/")
            .map(part => part.trim())
            .filter(Boolean);

    path.forEach((part, index) => {
        wrapper.appendChild(document.createTextNode(" "));

        const link = document.createElement("a");
        link.className = "post-catalog-link post";
        link.textContent = `⛡ ${part}`;

        const cumulativePath = path.slice(0, index + 1).join("/");
        link.href = `Codex.html?catalog=${encodeURIComponent(cumulativePath)}`;

        wrapper.appendChild(link);
    });
}

    function renderImages(container, postId) {
        container.textContent = "";

        let imageNumber = 1;

        const loadNext = () => {
            const src = `Codex-Img/${postId} (${imageNumber}).jpg`;
            const img = new Image();

            img.alt = `${postId} (${imageNumber})`;

            img.onload = () => {
                const imageBlock = document.createElement("div");
                imageBlock.className = "post-image post";
                imageBlock.appendChild(img);
                container.appendChild(imageBlock);

                imageNumber += 1;
                loadNext();
            };

            img.onerror = () => {
                // Image numbering is intentionally contiguous:
                // the first missing number ends the image sequence.
            };

            img.src = src;
        };

        loadNext();
    }

    function renderText(container, value) {
        const target = container.querySelector("span");
        if (target) target.textContent = value;
    }

    function renderTitle(container, value) {
        const target = container.querySelector("h2");
        if (target) target.textContent = value;
    }

    function renderContent(container, value) {
        const target = container.querySelector("p");
        if (target) target.textContent = value;
    }

    function renderTags(container, value) {
        const wrapper = container.querySelector("span");
        if (!wrapper) return;

        wrapper.textContent = "";

        const tags = Array.isArray(value)
            ? value
            : String(value || "")
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

        tags.forEach((tagText, index) => {
            const link = document.createElement("a");
            link.className = "post-tag-link post";
            link.textContent = tagText;
            link.href = `Codex.html?tag=${encodeURIComponent(
                tagText.replace(/^#/, "")
            )}`;

            wrapper.appendChild(link);

            if (index < tags.length - 1) {
                wrapper.appendChild(document.createTextNode(" "));
            }
        });
    }
})();
