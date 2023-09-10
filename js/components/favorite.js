let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Function to toggle favorite status
export function toggleFavorite(productId) {
  const index = favorites.indexOf(productId);

  if (index === -1) {
    // Adds to favorites if not already in it
    favorites.push(productId);
  } else {
    // Removes from favorites if already in it
    favorites.splice(index, 1);
  }

  // Saves updated favorites list to Local Storage
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Listens for clicks on favorite icons
document.addEventListener("click", function (event) {
  if (event.target.matches(".favorite-product")) {
    const productId = event.target.getAttribute("data-product-id");
    toggleFavorite(productId);

    // Updates the icon's appearance to indicate it's a favorite
    if (favorites.includes(productId)) {
      event.target.textContent = "favorite";
      event.target.classList.add("checked"); // Adds checked class for styling
    } else {
      event.target.textContent = "favorite_border";
      event.target.classList.remove("checked"); // Removes checked class
    }
  }
});

export function setFavoriteIcon(iconElement, productId) {
  if (favorites.includes(productId)) {
    iconElement.textContent = "favorite";
    iconElement.classList.add("checked");
  } else {
    iconElement.textContent = "favorite_border";
    iconElement.classList.remove("checked");
  }
}
