function updateBagCount() {
  const bag = JSON.parse(localStorage.getItem("bag") || "[]");
  const totalItems = bag.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("bag-item-count").textContent = totalItems;
}

function setActiveLink() {
  const links = document.querySelectorAll(".links a");
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

// To update the favorite icon in the header if there are any favorites in local storage
function updateFavoriteIcon() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const favoriteIcon = document.querySelector(".header-icon");

  if (favorites.length > 0) {
    favoriteIcon.textContent = "favorite";
  } else {
    favoriteIcon.textContent = "favorite_border";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../../header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-container").innerHTML = data;
      updateBagCount();
      setActiveLink();
      updateFavoriteIcon();
    });
});
