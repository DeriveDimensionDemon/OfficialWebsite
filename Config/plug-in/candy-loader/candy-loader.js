(() => {
    function initCandyLoader() {
        const root = document.querySelector(".candy-loader");
        if (!root) return;

        const cover = root.querySelector(".candy-cover");
        const river = root.querySelector(".candy-river");
        if (!cover || !river) return;

        // 初始：只顯示 Cover。
        root.classList.remove("is-open");
        river.hidden = true;

        const open = () => {
            root.classList.add("is-open");
            river.hidden = false;
        };

        const close = () => {
            root.classList.remove("is-open");
            river.hidden = true;
        };

        // PC：滑入圖片區域時現身；滑出整個 Candy 區域時收回。
        root.addEventListener("pointerenter", (event) => {
            if (event.pointerType === "mouse") open();
        });

        root.addEventListener("pointerleave", (event) => {
            if (event.pointerType === "mouse") close();
        });

        // 手機／觸控：第一次點 Cover 開啟；再次點 Candy 區域關閉。
        root.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            if (event.pointerType === "mouse") return;

            if (root.classList.contains("is-open")) {
                close();
            } else {
                open();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCandyLoader);
    } else {
        initCandyLoader();
    }
})();
