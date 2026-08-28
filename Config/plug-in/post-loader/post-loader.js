(() => {
    const root = document.getElementById("post-loader");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        root.textContent = "Post ID not found.";
        return;
    }

    const textPath = `Codex-Text/${id}.json`;

    fetch(textPath)
        .then(response => {
            if (!response.ok) throw new Error(`JSON not found: ${textPath}`);
            return response.json();
        })
        .then(data => {
            if (data.id !== id) {
                throw new Error(`ID mismatch: ${data.id || "(missing)"} !== ${id}`);
            }

            root.innerHTML = "";

            // Images: same base ID, numbered by Windows-style (1), (2), ...
            const images = document.createElement("div");

            let imageNumber = 1;
            let missingCount = 0;

            const loadNextImage = () => {
                const src = `Codex-Img/${id} (${imageNumber}).jpg`;
                const img = document.createElement("img");
                img.src = src;
                img.alt = `${id} (${imageNumber})`;

                img.onload = () => {
                    images.appendChild(img);
                    imageNumber++;
                    loadNextImage();
                };

                img.onerror = () => {
                    missingCount++;
                    if (missingCount === 1) {
                        renderPost(data, images);
                    }
                };
            };

            loadNextImage();
        })
        .catch(error => {
            root.textContent = error.message;
        });

    function renderPost(data, images) {
        root.appendChild(images);

        const title = document.createElement("div");
        title.textContent = data.title || "";
        root.appendChild(title);

        const date = document.createElement("div");
        date.textContent = data.date || "";
        root.appendChild(date);

        const catalog = document.createElement("div");
        catalog.textContent = data.catalog || "";
        root.appendChild(catalog);

        const content = document.createElement("div");
        content.textContent = data.content || "";
        root.appendChild(content);

        const tag = document.createElement("div");
        tag.textContent = data.tag || "";
        root.appendChild(tag);
    }
})();
