const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    menuButton.setAttribute(
      "aria-label",
      nav.classList.contains("is-open") ? "收起导航" : "展开导航",
    );
  });
}

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("已收到预约信息。这里可以接入真实表单提交。");
});
