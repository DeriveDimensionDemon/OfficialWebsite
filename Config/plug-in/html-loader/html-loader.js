document.addEventListener("DOMContentLoaded", () => {

    const target = document.getElementById("html-burger");

    if (!target) return;

    fetch("_burger.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("_burger.html load failed");
            }

            return response.text();
        })
        .then(html => {
            target.innerHTML = html;
        })
        .catch(error => {
            console.error("HTML Loader:", error);
        });

});