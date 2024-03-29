import { fetchFeaturedProducts } from "./api.js";
import { setFavoriteIcon } from "./components/favorite.js";
import { displayError } from "./components/messages.js";

const loader = document.querySelector(".loader");
const container = document.querySelector(".container");

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

async function allFeaturedProducts() {
  toggleLoader(true);
  try {
    const featuredProducts = await fetchFeaturedProducts();
    populateProductCards(featuredProducts);
  } catch (error) {
    container.innerHTML = displayError();
  } finally {
    toggleLoader(false);
  }
}

function populateProductCards(featuredProducts) {
  const templateCard = document.getElementById("template-card");
  const productCardsContainer = document.querySelector(".product-cards");

  featuredProducts.forEach((product) => {
    const newCard = templateCard.cloneNode(true); // Clones the template card to create a new card
    newCard.removeAttribute("id"); // Removes the id attribute from the new card

    const favoriteIcon = newCard.querySelector(".favorite-product"); // Selects the favorite icon in the new card
    favoriteIcon.setAttribute("data-product-id", product.id); // Sets the data-product-id attribute to the product id
    setFavoriteIcon(favoriteIcon, product.id); // Sets the favorite icon to the correct state

    newCard.querySelector(
      ".product-link"
    ).href = `product-page.html?productId=${product.id}`;
    newCard.querySelector(".product-image").src = product.images[0].src;
    newCard.querySelector(".product-image").alt = product.name;
    newCard.querySelector(".product-name").textContent = product.name;
    newCard.querySelector(
      ".product-price"
    ).textContent = `$${product.regular_price}`;
    newCard.querySelector(".quick-look-button").dataset.productId = product.id;

    productCardsContainer.appendChild(newCard);
  });
}

allFeaturedProducts();
