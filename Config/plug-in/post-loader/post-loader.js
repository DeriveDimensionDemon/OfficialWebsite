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

        async function renderPost(data) {
        const catalog = root.querySelector(".post-catalog.post");
        const images = root.querySelector(".post-images.post");
        const date = root.querySelector(".post-date.post");
        const title = root.querySelector(".post-title.post");
        const content = root.querySelector(".post-text.post");
        const tag = root.querySelector(".post-tag.post");
        const relatedLinks = root.querySelector(".post-related.post");

        if (!catalog || !images || !date || !title || !content || !tag || !relatedLinks) {
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
        await renderTags(tag, id);
        renderRelatedLinks(
            relatedLinks,
            data.related_links
        );
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
        container.textContent = "";

        const paragraphs = String(value || "")
            .split(/\n\s*\n/)
            .map(text => text.trim())
            .filter(Boolean);

        paragraphs.forEach(text => {
            const p = document.createElement("p");
            p.textContent = text;
            container.appendChild(p);
        });
    }

    function renderRelatedLinks(container, value) {
        const wrapper = container.querySelector("span");
        if (!wrapper) return;

        wrapper.textContent = "";

        if (!Array.isArray(value) || value.length === 0) {
            container.hidden = true;
            return;
        }

        container.hidden = false;

        value.forEach((item, index) => {
            if (!item || !item.url) return;

            if (index === 0) {
                const label = document.createElement("span");
                label.className = "post-related-label";
                label.textContent = "相關連結 ⇲";
                wrapper.appendChild(label);
                wrapper.appendChild(document.createElement("br"));
            }

            const link = document.createElement("a");

            link.className = "post-related-link post";
            link.href = item.url;
            link.textContent = item.url;

            if (item._blank === true) {
                link.target = "_blank";
                link.rel = "noopener";
            }

            wrapper.appendChild(link);

            if (index < value.length - 1) {
                wrapper.appendChild(
                    document.createTextNode(" ")
                );
            }
        });
    }
    
        async function renderTags(container, postId) {
        const wrapper = container.querySelector("span");
        if (!wrapper) return;

        wrapper.textContent = "";

        try {
            const response = await fetch("Codex-W/W-Tag.json");

            if (!response.ok) {
                throw new Error(`W-Tag request failed (${response.status})`);
            }

            const data = await response.json();
            const tags = [];

            for (const [tagName, node] of Object.entries(data?.tags || {})) {
                if (
                    Array.isArray(node?.posts) &&
                    node.posts.includes(postId)
                ) {
                    tags.push(tagName);
                }
            }

            tags.forEach((tagText, index) => {
                const link = document.createElement("a");

                link.className = "post-tag-link post";
                link.textContent = tagText;
                link.href =
                    `Codex.html?tag=${encodeURIComponent(tagText)}`;

                wrapper.appendChild(link);

                if (index < tags.length - 1) {
                    wrapper.appendChild(
                        document.createTextNode(" ")
                    );
                }
            });

        } catch (error) {
            console.error("Post Tag Loader:", error);
        }
    }
})();
