const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll(".nav a");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    menuButton.setAttribute(
      "aria-label",
      nav.classList.contains("is-open") ? "收起导航" : "展开导航",
    );
  });
}

if (navLinks.length) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const linkPage = new URL(link.href, window.location.href).pathname.split("/").pop() || "index.html";
    if (linkPage === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

document.querySelectorAll("[data-seasonal-promo]").forEach((promo) => {
  const startRaw = promo.getAttribute("data-start");
  const endRaw = promo.getAttribute("data-end");

  if (!startRaw || !endRaw) {
    return;
  }

  const startDate = new Date(`${startRaw}T00:00:00`);
  const endDate = new Date(`${endRaw}T23:59:59`);
  const today = new Date();

  if (today < startDate || today > endDate) {
    promo.remove();
  }
});

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("已收到预约信息。这里可以接入真实表单提交。");
});
