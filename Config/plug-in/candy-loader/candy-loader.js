(() => {
    const root = document.querySelector(".candy-loader");
    if (!root) return;

    const cover = root.querySelector(".candy-cover");
    const river = root.querySelector(".candy-river");

    if (!cover || !river) return;

    const postId = root.dataset.postId;

    // 初始：只顯示 Cover
    river.hidden = true;

    // 點 Cover → 展開 River
    cover.addEventListener("click", () => {
        cover.hidden = true;
        river.hidden = false;
    });

    // 點 River → 進入該篇 Post
    // 如果點到 breadcrumb 的連結，則保留 breadcrumb 原本功能
    river.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;

        window.location.href =
            `Post.html?id=${encodeURIComponent(postId)}`;
    });
})();