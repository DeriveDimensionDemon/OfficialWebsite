(() => {
    const root = document.querySelector(".candy-loader");
    if (!root) return;

    const river = root.querySelector(".candy-river");
    if (!river) return;

    const GITHUB_API = "https://api.github.com";
    const OWNER = "DeriveDimensionDemon";
    const REPO = "OfficialWebsite";
    const BRANCH = "main";
    const CODEX_TEXT_PATH = "Codex-Text";

    loadPosts()
        .then(posts => renderPosts(posts))
        .catch(error => {
            console.error("Candy Loader:", error);
            river.textContent = "";
        });

    async function loadPosts() {
        const files = await fetchJson(
            `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${CODEX_TEXT_PATH}?ref=${BRANCH}`
        );

        const jsonFiles = files
            .filter(file =>
                file.type === "file" &&
                file.name.toLowerCase().endsWith(".json")
            );

        const posts = await Promise.all(
            jsonFiles.map(async file => {
                const [data, createdAt] = await Promise.all([
                    fetchJson(
                        `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${encodePath(file.path)}`
                    ),
                    getCreatedAt(file.path)
                ]);

                return {
                    id: file.name.replace(/\.json$/i, ""),
                    title: getTitle(data, file.name),
                    createdAt
                };
            })
        );

        // Newest article first. The creation time is the oldest commit
        // in that file's Git history, not the latest modification time.
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return posts;
    }

    async function getCreatedAt(path) {
        let page = 1;
        let oldest = null;

        while (true) {
            const commits = await fetchJson(
                `${GITHUB_API}/repos/${OWNER}/${REPO}/commits?path=${encodeURIComponent(path)}&per_page=100&page=${page}`
            );

            if (!commits.length) break;

            oldest = commits[commits.length - 1];

            if (commits.length < 100) break;
            page++;
        }

        const date =
            oldest?.commit?.author?.date ||
            oldest?.commit?.committer?.date;

        if (!date) {
            throw new Error(`Cannot determine creation time: ${path}`);
        }

        return date;
    }

    async function fetchJson(url) {
        const response = await fetch(url, {
            headers: {
                "Accept": "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed (${response.status}): ${url}`);
        }

        return response.json();
    }

    function encodePath(path) {
        return path.split("/").map(encodeURIComponent).join("/");
    }

    function getTitle(data, filename) {
        if (data && typeof data === "object") {
            return data.title ||
                   data.name ||
                   data.meta?.title ||
                   data.article?.title ||
                   filename.replace(/\.json$/i, "");
        }

        return filename.replace(/\.json$/i, "");
    }

    function renderPosts(posts) {
        river.textContent = "";

        posts.forEach(post => {
            const guideline = document.createElement("div");
            guideline.className = "candy-guideline";

            const link = document.createElement("a");
            link.href = `Post.html?id=${encodeURIComponent(post.id)}`;
            link.className = "post-link index";

            const imageBlock = document.createElement("div");
            imageBlock.className = "post-image index";

            const img = document.createElement("img");
            img.className = "post index";
            img.alt = post.title || post.id;
            img.src = `Codex-Img/${post.id} (1).jpg`;

            const titleBlock = document.createElement("div");
            titleBlock.className = "post-title index";

            const title = document.createElement("h3");
            title.textContent = post.title || post.id;

            titleBlock.appendChild(title);
            imageBlock.appendChild(img);
            link.appendChild(imageBlock);
            link.appendChild(titleBlock);
            guideline.appendChild(link);
            river.appendChild(guideline);
        });
    }
})();
