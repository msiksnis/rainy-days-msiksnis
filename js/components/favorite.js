// js/components/favorite.js

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Function to toggle favorite status
export function toggleFavorite(productId) {
  const index = favorites.indexOf(productId);

  if (index === -1) {
    // Add to favorites if not already in it
    favorites.push(productId);
  } else {
    // Remove from favorites if already in it
    favorites.splice(index, 1);
  }

  // Save updated favorites list to Local Storage
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Listen for clicks on favorite icons
document.addEventListener("click", function (event) {
  if (event.target.matches(".favorite-product")) {
    const productId = event.target.getAttribute("data-product-id");
    toggleFavorite(productId);

    // Updates the icon's appearance to indicate it's a favorite
    if (favorites.includes(productId)) {
      event.target.textContent = "favorite"; // Filled heart icon
      event.target.classList.add("checked"); // Add checked class
    } else {
      event.target.textContent = "favorite_border"; // Empty heart icon
      event.target.classList.remove("checked"); // Remove checked class
    }
  }
});

export function setFavoriteIcon(iconElement, productId) {
  if (favorites.includes(productId)) {
    iconElement.textContent = "favorite"; // Filled heart icon
    iconElement.classList.add("checked"); // Add checked class
  } else {
    iconElement.textContent = "favorite_border"; // Empty heart icon
    iconElement.classList.remove("checked"); // Remove checked class
  }
}
