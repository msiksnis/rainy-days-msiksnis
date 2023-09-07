import { fetchProductById } from "./api.js";
import { displayError } from "./components/messages.js";

const loader = document.querySelector(".loader");
const favoritesContainer = document.getElementById("favorite-cards");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
const container = document.querySelector(".container");

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

function toggleFavorite(productId) {
  const index = favorites.indexOf(productId);

  if (index === -1) {
    favorites.push(productId);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

document.addEventListener("DOMContentLoaded", function () {
  async function renderFavorites() {
    // Fetch the details of each favorite product from the API
    const favoriteProducts = [];

    for (const productId of favorites) {
      showLoader();
      try {
        const product = await fetchProductById(productId);
        favoriteProducts.push(product);
      } catch (error) {
        container.innerHTML = displayError();
      } finally {
        hideLoader();
      }
    }

    // Generate the HTML for each favorite product
    const favoriteHTML = favoriteProducts
      .map(
        (product) => `
      <section class="grid-item">
        <div class="card-container">
          <div class="favorite-icon">
            <span class="material-icons-outlined favorite-product favorite-solid" data-product-id="${product.id}">
            favorite
            </span>
          </div>
          <a href="product-page.html?productId=${product.id}">
            <img class="product-image" src="${product.images[0].url}" alt="${product.name}" />
          </a>
          <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-price">$${product.price}</div>
          </div>
          <button class="quick-look-button" data-product-id="${product.id}">Quick Look</button>
        </div>
      </section>
    `
      )
      .join("");

    // Update the DOM
    favoritesContainer.innerHTML = favoriteHTML;
  }

  favoritesContainer.addEventListener("click", async function (e) {
    if (e.target.classList.contains("favorite-product")) {
      const productId = e.target.getAttribute("data-product-id");

      // Toggle the favorite status of the clicked product
      toggleFavorite(productId);

      // Re-render the favorite products
      await renderFavorites();
    }
  });

  renderFavorites();
});
