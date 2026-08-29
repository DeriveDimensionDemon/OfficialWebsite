(() => {
    const root = document.querySelector(".candy-loader");
    if (!root) return;

    const river = root.querySelector(".candy-river.index");
    if (!river) return;

    const listPath = "Config/plug-in/candy-loader/candy-list.json";

    fetch(listPath)
        .then(response => {
            if (!response.ok) throw new Error(`Candy list not found: ${listPath}`);
            return response.json();
        })
        .then(posts => {
            river.textContent = "";

            posts.forEach(post => {
                const row = document.createElement("article");
                row.className = "candy-post index scroll-enter";

                const link = document.createElement("a");
                link.className = "post-cover index-link";
                link.href = `Post.html?id=${encodeURIComponent(post.id)}`;
                link.setAttribute("aria-label", post.title || post.id);

                const cover = document.createElement("div");
                cover.className = "post-cover index";
                cover.style.backgroundImage =
                    `url("Codex-Img/${encodeURIComponent(post.id)}%20(1).jpg")`;
                link.appendChild(cover);

                const title = document.createElement("h2");
                title.className = "post-title index";

                const titleLink = document.createElement("a");
                titleLink.href = `Post.html?id=${encodeURIComponent(post.id)}`;
                titleLink.textContent = post.title || post.id;
                title.appendChild(titleLink);

                row.appendChild(link);
                row.appendChild(title);
                river.appendChild(row);
            });

            const items = river.querySelectorAll(".candy-post.index");
            if (!("IntersectionObserver" in window)) {
                items.forEach(item => item.classList.add("is-visible"));
                return;
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                });
            }, {
                threshold: 0.08,
                rootMargin: "0px 0px -10% 0px"
            });

            items.forEach(item => observer.observe(item));
        })
        .catch(error => {
            river.textContent = error.message;
        });
})();
