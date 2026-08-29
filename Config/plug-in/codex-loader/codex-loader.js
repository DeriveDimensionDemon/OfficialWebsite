(() => {
    const catalogRoot = document.getElementById("codex-filter-catalog");
    const tagRoot = document.getElementById("codex-filter-tag");

    // Codex result area: use the page's .codex-loader containing .codex-header.
    const resultRoot = document.querySelector(
        ".codex-loader:has(.codex-header)"
    );

    if (!catalogRoot && !tagRoot && !resultRoot) return;

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

            if (resultRoot) {
                requests.push(loadCodexResult());
            }

            await Promise.all(requests);
        } catch (error) {
            console.error("Codex-W:", error);
        }
    }

    async function loadCodexResult() {
        const params = new URLSearchParams(window.location.search);
        const catalogQuery = params.get("catalog");
        const tagQuery = params.get("tag");

        try {
            const requests = [];

            if (catalogQuery !== null) {
                requests.push(
                    fetch("Codex-W/W-Catalog.json").then(async response => {
                        if (!response.ok) {
                            throw new Error(`W-Catalog request failed (${response.status})`);
                        }

                        return {
                            type: "catalog",
                            data: await response.json()
                        };
                    })
                );
            }

            if (tagQuery !== null) {
                requests.push(
                    fetch("Codex-W/W-Tag.json").then(async response => {
                        if (!response.ok) {
                            throw new Error(`W-Tag request failed (${response.status})`);
                        }

                        return {
                            type: "tag",
                            data: await response.json()
                        };
                    })
                );
            }

            if (catalogQuery === null && tagQuery === null) {
                requests.push(
                    fetch("Codex-W/W-Catalog.json").then(async response => {
                        if (!response.ok) {
                            throw new Error(`W-Catalog request failed (${response.status})`);
                        }

                        return {
                            type: "catalog-all",
                            data: await response.json()
                        };
                    })
                );
            }

            const results = await Promise.all(requests);
            const result = results[0];

            if (result.type === "tag") {
                await renderTagResult(result.data, tagQuery);
            } else {
                await renderCatalogResult(
                    result.data,
                    catalogQuery
                );
            }

        } catch (error) {
            console.error("Codex result:", error);
            renderMessage("Unable to load Codex.");
        }
    }

    async function renderCatalogResult(data, catalogQuery) {
        clearResult();

        const title = catalogQuery === null || catalogQuery === "All"
            ? "▧ Codex All"
            : `◢ ${getLastPathPart(catalogQuery)}`;

        appendResultHeader(title);

        let node = data?.catalogs || {};

        if (catalogQuery && catalogQuery !== "All") {
            node = findCatalogNode(
                node,
                catalogQuery.split("/")
            );
        }

        if (!node) {
            renderMessage("Catalog not found.");
            return;
        }

        if (catalogQuery === null || catalogQuery === "All") {
            await renderCatalogNodes(
                node,
                "",
                true
            );
        } else {
            await renderCatalogNode(
                getLastPathPart(catalogQuery),
                node,
                catalogQuery,
                0,
                true
            );
        }
    }

    async function renderCatalogNodes(
        nodes,
        parentPath = "",
        showAllRoots = false
    ) {
        // Root catalog object.
        if (showAllRoots) {
            for (const [name, node] of Object.entries(nodes)) {
                await renderCatalogNode(
                    name,
                    node,
                    name,
                    0
                );
            }

            return;
        }

        // A selected Catalog node.
        if (
            nodes &&
            typeof nodes === "object" &&
            !Array.isArray(nodes)
        ) {
            const name = getLastPathPart(parentPath);

            await renderCatalogNode(
                name,
                nodes,
                parentPath,
                0,
                false
            );
        }
    }

    async function renderCatalogNode(
        name,
        node,
        path,
        depth,
        showTitle = true
    ) {
        const catalog = document.createElement("div");
        catalog.className = "codex-catalog";

        if (showTitle) {
            const catalogTitle = document.createElement("div");
            catalogTitle.className = "codex-catalog-title";
            catalogTitle.textContent =
                `${indent(depth)}⛡ ${name}`;

            catalog.appendChild(catalogTitle);
        }

        const posts = Array.isArray(node?.posts)
            ? node.posts
            : [];

        // Posts are optional.
        // The Catalog itself is still rendered when posts is empty.
        if (posts.length > 0) {
            const postList = document.createElement("div");
            postList.className = "codex-post-list";

            const postData = await loadPostData(posts);

            for (const postId of posts) {
                const data = postData.get(postId);

                postList.appendChild(
                    createPostElement(
                        postId,
                        data,
                        depth + (showTitle ? 1 : 0)
                    )
                );
            }

            catalog.appendChild(postList);
        }

        resultRoot.appendChild(catalog);

        // Children are independent of Posts.
        if (
            node?.children &&
            typeof node.children === "object"
        ) {
            for (
                const [childName, childNode]
                of Object.entries(node.children)
            ) {
                await renderCatalogNode(
                    childName,
                    childNode,
                    path
                        ? `${path}/${childName}`
                        : childName,
                    depth + 1
                );
            }
        }
    }

    async function renderTagResult(data, tag) {
        clearResult();

        appendResultHeader(`⌁ #${tag}`);

        const tagData = data?.tags?.[tag];

        if (
            !tagData ||
            !Array.isArray(tagData.posts)
        ) {
            renderMessage("Tag not found.");
            return;
        }

        const posts = await loadPostData(
            tagData.posts
        );

        const postList = document.createElement("div");
        postList.className = "codex-post-list";

        for (const postId of tagData.posts) {
            postList.appendChild(
                createPostElement(
                    postId,
                    posts.get(postId),
                    0
                )
            );
        }

        resultRoot.appendChild(postList);
    }

    async function loadPostData(postIds) {
        const dataMap = new Map();

        await Promise.all(
            postIds.map(async postId => {
                try {
                    const response = await fetch(
                        `Codex-Text/${encodeURIComponent(postId)}.json`
                    );

                    if (!response.ok) return;

                    const data = await response.json();

                    if (
                        data &&
                        data.id === postId
                    ) {
                        dataMap.set(
                            postId,
                            data
                        );
                    }

                } catch {
                    // Keep the post ID;
                    // renderer will fall back to it.
                }
            })
        );

        return dataMap;
    }

    function createPostElement(
        postId,
        data,
        depth
    ) {
        const post = document.createElement("div");
        post.className = "codex-post";
        post.dataset.postId = postId;

        const title = document.createElement("div");
        title.className = "codex-post-title";

        const link = document.createElement("a");
        link.href =
            `Post.html?id=${encodeURIComponent(postId)}`;

        link.textContent =
            data?.title ||
            humanizeId(postId);

        title.appendChild(link);

        const date = document.createElement("div");
        date.className = "codex-post-date";
        date.textContent =
            data?.date || "";

        if (depth > 0) {
            post.style.marginLeft =
                `${depth}em`;
        }

        post.appendChild(title);

        if (date.textContent) {
            post.appendChild(date);
        }

        return post;
    }

    function clearResult() {
        if (!resultRoot) return;

        const header =
            resultRoot.querySelector(
                ".codex-header"
            );

        resultRoot.replaceChildren();

        if (header) {
            resultRoot.appendChild(header);
        }
    }

    function appendResultHeader(text) {
        if (!resultRoot) return;

        let header =
            resultRoot.querySelector(
                ".codex-header"
            );

        if (!header) {
            header = document.createElement("div");
            header.className = "codex-header";
            resultRoot.appendChild(header);
        }

        header.textContent = text;
    }

    function renderMessage(text) {
        if (!resultRoot) return;

        const message =
            document.createElement("div");

        message.className =
            "codex-message";

        message.textContent = text;

        resultRoot.appendChild(message);
    }

    function findCatalogNode(
        catalogs,
        parts
    ) {
        let current = catalogs;

        for (
            let i = 0;
            i < parts.length;
            i++
        ) {
            const part = parts[i];

            if (
                !current ||
                typeof current !== "object"
            ) {
                return null;
            }

            const node =
                current[part];

            if (!node) {
                return null;
            }

            if (
                i === parts.length - 1
            ) {
                return node;
            }

            current =
                node.children;
        }

        return null;
    }

    function getLastPathPart(path) {
        const parts =
            String(path || "").split("/");

        return (
            parts[parts.length - 1] ||
            "Codex"
        );
    }

    async function buildCatalogSelector(data) {
        const select =
            catalogRoot.querySelector("select");

        if (!select) return;

        const placeholder =
            select.querySelector(
                'option[value=""]'
            );

        select.textContent = "";

        if (placeholder) {
            select.appendChild(
                placeholder
            );
        } else {
            const option =
                createOption(
                    "",
                    "⛛ Select Catalog",
                    "placeholder"
                );

            option.disabled = true;
            option.selected = true;
            option.hidden = true;

            select.appendChild(option);
        }

        // Home is a navigation item,
        // not Catalog data.
        select.appendChild(
            createOption(
                "Home",
                "⛚ Home",
                "home",
                "Home"
            )
        );

        // Codex root.
        select.appendChild(
            createOption(
                "All",
                "⛞ Codex All",
                "catalog",
                "All"
            )
        );

        const printPosts =
            new Set(
                Array.isArray(
                    data?.selector?.print_posts
                )
                    ? data.selector.print_posts
                    : []
            );

        await appendCatalogs(
            select,
            data?.catalogs || {},
            "",
            0,
            printPosts
        );

        select.addEventListener(
            "change",
            () => {
                const option =
                    select.options[
                        select.selectedIndex
                    ];

                if (!option) return;

                if (
                    option.dataset.type ===
                    "home"
                ) {
                    window.location.href =
                        "index.html";

                    return;
                }

                if (
                    option.dataset.type ===
                    "post"
                ) {
                    window.location.href =
                        `Post.html?id=${encodeURIComponent(option.value)}`;

                    return;
                }

                if (
                    option.value === "All"
                ) {
                    window.location.href =
                        "Codex.html";

                    return;
                }

                window.location.href =
                    `Codex.html?catalog=${encodeURIComponent(option.value)}`;
            }
        );
    }

    async function appendCatalogs(
        select,
        catalogs,
        parentPath,
        depth,
        printPosts
    ) {
        for (
            const [name, node]
            of Object.entries(catalogs)
        ) {
            const path =
                parentPath
                    ? `${parentPath}/${name}`
                    : name;

            select.appendChild(
                createOption(
                    path,
                    `${indent(depth)}⛡ ${name}`,
                    "catalog",
                    path
                )
            );

            if (
                printPosts.has(path) &&
                Array.isArray(node?.posts)
            ) {
                const titles =
                    await loadPostTitles(
                        node.posts
                    );

                node.posts.forEach(
                    postId => {
                        select.appendChild(
                            createOption(
                                postId,
                                `${indent(depth + 1)}⇲ ${titles.get(postId) || humanizeId(postId)}`,
                                "post",
                                postId
                            )
                        );
                    }
                );
            }

            if (
                node?.children &&
                typeof node.children === "object"
            ) {
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

    async function loadPostTitles(
        postIds
    ) {
        const titles = new Map();

        await Promise.all(
            postIds.map(
                async postId => {
                    try {
                        const response =
                            await fetch(
                                `Codex-Text/${encodeURIComponent(postId)}.json`
                            );

                        if (!response.ok)
                            return;

                        const data =
                            await response.json();

                        // Only trust a title when
                        // the Post JSON confirms its ID.
                        if (
                            data &&
                            data.id === postId &&
                            data.title
                        ) {
                            titles.set(
                                postId,
                                data.title
                            );
                        }

                    } catch {
                        // Falls back to a readable ID.
                    }
                }
            )
        );

        return titles;
    }

    function buildTagSelector(data) {
        const select =
            tagRoot.querySelector("select");

        if (!select) return;

        const placeholder =
            select.querySelector(
                'option[value=""]'
            );

        select.textContent = "";

        if (placeholder) {
            select.appendChild(
                placeholder
            );
        } else {
            const option =
                createOption(
                    "",
                    "⛛ Select Tag",
                    "placeholder"
                );

            option.disabled = true;
            option.selected = true;
            option.hidden = true;

            select.appendChild(
                option
            );
        }

        for (
            const [groupName, tags]
            of Object.entries(
                data?.groups || {}
            )
        ) {
            const group =
                document.createElement(
                    "optgroup"
                );

            group.label =
                `↘ ${groupName}`;

            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    group.appendChild(
                        createOption(
                            tag,
                            `#${tag}`,
                            "tag",
                            tag
                        )
                    );
                });
            }

            select.appendChild(group);
        }

        select.addEventListener(
            "change",
            () => {
                const option =
                    select.options[
                        select.selectedIndex
                    ];

                if (!option) return;

                window.location.href =
                    `Codex.html?tag=${encodeURIComponent(option.value)}`;
            }
        );
    }

    function createOption(
        value,
        text,
        type,
        target = ""
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = text;
        option.dataset.type = type;

        if (target) {
            option.dataset.target =
                target;
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