function setActiveLinkForFooter() {
  const footerLinks = document.querySelectorAll("#footer-container a");
  footerLinks.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active-footer-link");
    } else {
      link.classList.remove("active-footer-link");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../../footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
      setActiveLinkForFooter();
    });
});
