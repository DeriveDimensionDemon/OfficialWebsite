(() => {
    const loader = document.querySelector(".candy-loader");
    if (!loader) return;

    const covers = Array.from(loader.querySelectorAll(".post-cover.index"));

    // Each index cover is an independent post entry.
    // The actual cover is the first image in Codex-Img for that post;
    // the transparent candy-loader-fix.png remains the foreground layer.
    covers.forEach((cover) => {
        const postId = cover.dataset.postId;
        if (!postId) return;

        const imageUrl = `Codex-Img/${encodeURIComponent(postId)}%20(1).jpg`;
        cover.style.backgroundImage = `url("${imageUrl}")`;

        cover.addEventListener("click", () => {
            window.location.href = `Post.html?id=${encodeURIComponent(postId)}`;
        });
    });
})();
