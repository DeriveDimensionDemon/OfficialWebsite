(() => {
    const catalogRoot = document.getElementById("codex-filter-catalog");
    const tagRoot = document.getElementById("codex-filter-tag");

    if (!catalogRoot && !tagRoot) return;

    loadSelectors();

    async function loadSelectors() {
        try {
            const requests = [];

            if (catalogRoot) {
                requests.push(
                    fetch("Codex-W/W-Catalog.json")
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`W-Catalog request failed (${response.status})`);
                            }
                            return response.json();
                        })
                        .then(data => buildCatalogSelector(data))
                );
            }

            if (tagRoot) {
                requests.push(
                    fetch("Codex-W/W-Tag.json")
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`W-Tag request failed (${response.status})`);
                            }
                            return response.json();
                        })
                        .then(data => buildTagSelector(data))
                );
            }

            await Promise.all(requests);
        } catch (error) {
            console.error("Codex-W:", error);
        }
    }

    async function buildCatalogSelector(data) {
        const select = catalogRoot.querySelector("select");
        if (!select) return;

        const placeholder = select.querySelector('option[value=""]');
        select.textContent = "";

        if (placeholder) {
            select.appendChild(placeholder);
        } else {
            const option = createOption("", "⛛ Select Catalog", "placeholder");
            option.disabled = true;
            option.selected = true;
            option.hidden = true;
            select.appendChild(option);
        }

        // Home is a navigation item, not Catalog data.
        select.appendChild(
            createOption("Home", "⛚ Home", "home", "Home")
        );

        // Codex root.
        select.appendChild(
            createOption("All", "⛞ Codex All", "catalog", "All")
        );

        const printPosts = new Set(
            Array.isArray(data?.selector?.print_posts)
                ? data.selector.print_posts
                : []
        );

        await appendCatalogs(select, data?.catalogs || {}, "", 0, printPosts);

select.addEventListener("change", () => {
    const option = select.options[select.selectedIndex];
    if (!option) return;

    if (option.dataset.type === "home") {
        window.location.href = "index.html";
        return;
    }

    if (option.dataset.type === "post") {
        window.location.href =
            `Post.html?id=${encodeURIComponent(option.value)}`;
        return;
    }

    if (option.value === "All") {
        window.location.href = "Codex.html";
        return;
    }

    window.location.href =
        `Codex.html?catalog=${encodeURIComponent(option.value)}`;
});
    }

    async function appendCatalogs(select, catalogs, parentPath, depth, printPosts) {
        for (const [name, node] of Object.entries(catalogs)) {
            const path = parentPath ? `${parentPath}/${name}` : name;

            select.appendChild(
                createOption(
                    path,
                    `${indent(depth)}⛡ ${name}`,
                    "catalog",
                    path
                )
            );

            if (printPosts.has(path) && Array.isArray(node?.posts)) {
                const titles = await loadPostTitles(node.posts);

                node.posts.forEach(postId => {
                    select.appendChild(
                        createOption(
                            postId,
                            `${indent(depth + 1)}⇲ ${titles.get(postId) || humanizeId(postId)}`,
                            "post",
                            postId
                        )
                    );
                });
            }

            if (node?.children && typeof node.children === "object") {
                await appendCatalogs(
                    select,
                    node.children,
                    path,
                    depth + 1,
                    printPosts
                );
            }
        }
    }

    async function loadPostTitles(postIds) {
        const titles = new Map();

        await Promise.all(
            postIds.map(async postId => {
                try {
                    const response = await fetch(
                        `Codex-Text/${encodeURIComponent(postId)}.json`
                    );

                    if (!response.ok) return;

                    const data = await response.json();

                    // Only trust a title when the Post JSON confirms its own ID.
                    if (data && data.id === postId && data.title) {
                        titles.set(postId, data.title);
                    }
                } catch {
                    // Falls back to a readable ID.
                }
            })
        );

        return titles;
    }

    function buildTagSelector(data) {
        const select = tagRoot.querySelector("select");
        if (!select) return;

        const placeholder = select.querySelector('option[value=""]');
        select.textContent = "";

        if (placeholder) {
            select.appendChild(placeholder);
        } else {
            const option = createOption("", "⛛ Select Tag", "placeholder");
            option.disabled = true;
            option.selected = true;
            option.hidden = true;
            select.appendChild(option);
        }

        for (const [groupName, tags] of Object.entries(data?.groups || {})) {
            const group = document.createElement("optgroup");
            group.label = `↘ ${groupName}`;

            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    group.appendChild(createOption(tag, `#${tag}`, "tag", tag));
                });
            }

            select.appendChild(group);
        }

        select.addEventListener("change", () => {
            const option = select.options[select.selectedIndex];
            if (!option) return;

            window.location.href =
                `Codex.html?tag=${encodeURIComponent(option.value)}`;
        });
    }

    function createOption(value, text, type, target = "") {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        option.dataset.type = type;

        if (target) {
            option.dataset.target = target;
        }

        return option;
    }

    function indent(depth) {
        return "\u3000".repeat(depth);
    }

    function humanizeId(id) {
        return String(id || "")
            .replace(/^_/, "")
            .replace(/[-_]+/g, " ")
            .trim();
    }
})();
