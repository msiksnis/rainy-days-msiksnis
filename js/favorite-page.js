import { fetchProductById } from "./api.js";
import { setFavoriteIcon } from "./components/favorite.js";
import { displayError } from "./components/messages.js";

const loader = document.querySelector(".loader");
const favoritesContainer = document.getElementById("favorite-cards");
const container = document.querySelector(".container");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

async function fetchAndRenderFavorites() {
  toggleLoader(true);
  try {
    const favoriteProducts = await Promise.all(favorites.map(fetchProductById));
    populateFavoriteCards(favoriteProducts);
  } catch (error) {
    container.innerHTML = displayError();
    console.error(error);
  } finally {
    toggleLoader(false);
  }
}

function populateFavoriteCards(favoriteProducts) {
  const templateCard = document.getElementById("template-card");

  favoriteProducts.forEach((product) => {
    // To clone the template card to create a new card for each product
    const newCard = templateCard.cloneNode(true);
    newCard.removeAttribute("id");

    const favoriteIcon = newCard.querySelector(".favorite-product"); // Selects the favorite icon in the new card
    favoriteIcon.setAttribute("data-product-id", product.id); // Sets the data-product-id attribute to the product id
    setFavoriteIcon(favoriteIcon, product.id); // Sets the favorite icon to the correct state

    newCard.querySelector(
      ".product-link"
    ).href = `product-page.html?productId=${product.id}`;
    newCard.querySelector(".product-image").src = product.images[0].url;
    newCard.querySelector(".product-image").alt = product.name;
    newCard.querySelector(".product-name").textContent = product.name;
    newCard.querySelector(".product-price").textContent = `$${product.price}`;
    newCard.querySelector(".quick-look-button").dataset.productId = product.id;

    favoritesContainer.appendChild(newCard);
  });
}

fetchAndRenderFavorites();

// This part is for removing product from local storage and DOM  when unfavorited
favoritesContainer.addEventListener("click", (event) => {
  if (event.target.matches(".favorite-product")) {
    const productId = event.target.getAttribute("data-product-id");
    const productCard = event.target.closest(".grid-item"); // Gets the parent product card of the clicked favorite icon

    // Removes the product from the favorites list in local storage by filtering it out of the array and saving the new array to local storage
    const index = favorites.indexOf(productId);
    if (index !== -1) {
      favorites.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    // Removes the product card from the DOM
    productCard.remove();
  }
});
