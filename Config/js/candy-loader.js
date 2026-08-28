/* -------------------- */
/*  CANDY LOADER DEMON */
/* -------------------- */

const candyLoader = document.getElementById("candy-loader");


const candies = [
    {
        title: "Introduction",
        cover: "Codex/Official/Img/Introduction (1).png",
        text: "Derive Dimension Demon （推導維度惡魔）是一個於2026年創立的混合娛樂IP，以架空敘事設計與原創角色、劇情，推進一組實驗性虛實混合或架空內容創作。",
        tag: "#DDD_Official"
    },

    {
        title: "Candy Loader 02",
        cover: "Codex/Official/Img/Introduction (1).png",
        text: "第二顆測試 Candy。這一顆只是用來確認上下進出場動畫。",
        tag: "#DDD_Test"
    },

    {
        title: "Candy Loader 03",
        cover: "Codex/Official/Img/Introduction (1).png",
        text: "第三顆測試 Candy。快速滾動也可以連續切換。",
        tag: "#DDD_Test"
    }
];


let index = 0;
let busy = false;
let wheelIntent = 0;
let touchStartY = null;


function createCandy(data, state = "active") {

    const candy = document.createElement("div");

    candy.className = `post-candy ${state}`;

    candy.innerHTML = `
        <div class="post-title"><h2>${data.title}</h2></div>
        <div class="post-cover"><img src="${data.cover}" alt=""></div>
        <div class="post-text"><p>${data.text}</p></div>
        <div class="post-tag"><span>${data.tag}</span></div>
    `;

    return candy;
}


function showCandy() {

    candyLoader.replaceChildren(
        createCandy(candies[index])
    );

}


function changeCandy(direction) {

    if (busy) {

        wheelIntent += direction;

        return;

    }


    const nextIndex = index + direction;


    if (
        nextIndex < 0 ||
        nextIndex >= candies.length
    ) {

        wheelIntent = 0;

        return;

    }


    busy = true;


    const current =
        candyLoader.querySelector(".post-candy");


    index = nextIndex;


    const next = createCandy(
        candies[index],
        direction > 0
            ? "enter-next"
            : "enter-prev"
    );


    candyLoader.appendChild(next);


    next.offsetHeight;


    requestAnimationFrame(() => {

        current.classList.add(
            direction > 0
                ? "exit-next"
                : "exit-prev"
        );


        next.classList.remove(
            "enter-next",
            "enter-prev"
        );


        next.classList.add("active");

    });


    setTimeout(() => {

        current.remove();

        busy = false;


        if (wheelIntent !== 0) {

            const queuedDirection =
                wheelIntent > 0 ? 1 : -1;


            wheelIntent -= queuedDirection;


            changeCandy(queuedDirection);

        }

    }, 450);

}


window.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        changeCandy(
            event.deltaY > 0
                ? 1
                : -1
        );

    },
    {passive: false}
);


window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowDown" ||
            event.key === "PageDown"
        ) {

            event.preventDefault();

            changeCandy(1);

        }


        if (
            event.key === "ArrowUp" ||
            event.key === "PageUp"
        ) {

            event.preventDefault();

            changeCandy(-1);

        }

    }
);


candyLoader.addEventListener(
    "touchstart",
    event => {

        touchStartY =
            event.changedTouches[0].clientY;

    },
    {passive: true}
);


candyLoader.addEventListener(
    "touchend",
    event => {

        if (touchStartY === null) {
            return;
        }


        const touchEndY =
            event.changedTouches[0].clientY;


        const delta =
            touchStartY - touchEndY;


        touchStartY = null;


        if (Math.abs(delta) < 40) {
            return;
        }


        changeCandy(
            delta > 0 ? 1 : -1
        );

    },
    {passive: true}
);


showCandy();