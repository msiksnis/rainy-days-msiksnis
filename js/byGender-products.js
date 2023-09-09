// byGender-products.js

import { fetchProducts } from "./api.js";
import { setFavoriteIcon } from "./components/favorite.js";
import { displayError } from "./components/messages.js";

const loader = document.querySelector(".loader");
const container = document.querySelector(".container");

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function getGenderFromPage() {
  const mainElement = document.querySelector("main"); // Selects the main tag where gender is set

  return mainElement.getAttribute("data-gender"); // Gets the gender from the data-gender attribute
}

async function fetchAndFilterProducts() {
  const gender = getGenderFromPage();
  toggleLoader(true);
  try {
    const allProducts = await fetchProducts();
    const genderSpecificProducts = allProducts.filter(
      (product) => product.gender === gender // Gender value here that was set in the main tag
    );
    populateProductCards(genderSpecificProducts);
  } catch (error) {
    container.innerHTML = displayError();
  } finally {
    toggleLoader(false);
  }
}

function populateProductCards(genderSpecificProducts) {
  const templateCard = document.getElementById("template-card");
  const productCardsContainer = document.querySelector(".product-cards");

  genderSpecificProducts.forEach((product) => {
    const newCard = templateCard.cloneNode(true); // Cloning the template card to create a new card
    newCard.removeAttribute("id"); // Removing the id attribute from the new card

    const favoriteIcon = newCard.querySelector(".favorite-product"); // Selecting the favorite icon in the new card
    favoriteIcon.setAttribute("data-product-id", product.id); // Setting the data-product-id attribute to the product id
    setFavoriteIcon(favoriteIcon, product.id); // Setting the favorite icon to the correct state

    newCard.querySelector(
      ".product-link"
    ).href = `product-page.html?productId=${product.id}`;
    newCard.querySelector(".product-image").src = product.images[0].url;
    newCard.querySelector(".product-image").alt = product.name;
    newCard.querySelector(".product-name").textContent = product.name;
    newCard.querySelector(".product-price").textContent = `$${product.price}`;
    newCard.querySelector(".quick-look-button").dataset.productId = product.id;

    productCardsContainer.appendChild(newCard);
  });
}

fetchAndFilterProducts();
