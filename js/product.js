import { fetchProductById } from "./api.js";
import {
  showWarningMessage,
  hideWarningMessage,
  showTemporaryWarningMessage,
  displayError,
} from "./components/messages.js";
import { setFavoriteIcon } from "./components/favorite.js";

const productID = getProductIdFromUrl();
const productTitles = document.querySelectorAll(".product-title");
const price = document.querySelector("#price");
const colors = document.querySelector("#color");
const sizeOptions = document.querySelector(".select-size-options #size");
const loader = document.querySelector(".loader");
const title = document.querySelector("title");
const description = document.querySelector("#description");
const container = document.querySelector(".container");

function getVariantIdentifier() {
  const selectedColor = document.querySelector(".color.selected");
  const selectedSize = document.querySelector(".size-option.selected");
  if (selectedColor && selectedSize) {
    return `${productID}-${selectedColor.dataset.color}-${selectedSize.dataset.size}`;
  }
  return null;
}

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("productId");
}

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function updateAddToBagButton() {
  const addToBagButton = document.querySelector("#add-to-bag-button");
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");
  let existingItem = bag.find(
    (item) => item.variantID === getVariantIdentifier()
  );

  if (existingItem) {
    addToBagButton.textContent = "Product is in the Bag";
    addToBagButton.classList.add("item-in-bag"); // This is an extra class that is used to style the button differently when the product is already in the bag
  } else {
    addToBagButton.textContent = "Add to Bag";
    addToBagButton.classList.remove("item-in-bag");
  }
}

function updateMainImage(src) {
  document.querySelector("#displayed-image").src = src;
}

async function fetchProduct() {
  toggleLoader(true);
  try {
    const product = await fetchProductById(productID);
    productDetailsCard(product);

    updateAddToBagButton();
  } catch (error) {
    console.log(error);
    container.innerHTML = displayError();
  } finally {
    toggleLoader(false);
  }
}

function productDetailsCard(product) {
  title.textContent = product.name; // Sets the title of the page to the product name

  productTitles.forEach((title) => (title.textContent = product.name)); // Because I have two h1s with the same class 'product-title', I am using forEach to update both of them

  let galleryHTML = product.images
    .map(
      (image) =>
        `<img class="thumbnail" src="${image.src}" alt="${product.name}">`
    )
    .join("");

  document.querySelector(".thumbnails").innerHTML = galleryHTML;

  document.querySelectorAll(".thumbnail").forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      updateMainImage(this.src);
    });
  });

  document.querySelector("#displayed-image").src = product.images[0].src; // Sets the main image to the first image in the array

  price.textContent = `$${product.regular_price}`;

  const favoriteIcon = document.querySelector(".favorite-product");
  favoriteIcon.setAttribute("data-product-id", product.id);

  // Checks if the product is already in the favorites list
  setFavoriteIcon(favoriteIcon, product.id);

  let colorAttribute = product.attributes.find(
    (attr) => attr.name.toLowerCase() === "color"
  );
  let sizeAttribute = product.attributes.find(
    (attr) => attr.name.toLowerCase() === "size"
  );

  let colorHTML = colorAttribute.options
    .map(
      (color) =>
        `<p class="color" data-color="${color}" style="background-color:${color}"></p>`
    )
    .join("");

  colors.innerHTML = colorHTML;

  let sizeHTML = sizeAttribute.options
    .map((size) => `<p class="size-option" data-size="${size}">${size}</p>`)
    .join("");

  sizeOptions.innerHTML = sizeHTML;

  description.textContent = product.description;

  updateAddToBagButton();
  addSelectionListeners();
}

function addSelectionListeners() {
  document.querySelectorAll(".color").forEach((colorDiv) => {
    colorDiv.addEventListener("click", function () {
      document.querySelectorAll(".color.selected").forEach((selectedColor) => {
        selectedColor.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });

  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    sizeDiv.addEventListener("click", function () {
      document
        .querySelectorAll(".size-option.selected")
        .forEach((selectedSize) => {
          selectedSize.classList.remove("selected");
        });
      this.classList.add("selected");

      const selectedColor = document.querySelector(".color.selected");
      const selectedSize = document.querySelector(".size-option.selected");
      if (selectedColor && selectedSize) {
        hideWarningMessage();
      }

      updateAddToBagButton();
    });
  });
}

function addToBag(product) {
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");

  console.log("this is local storage bag PRODUCT", bag);

  let existingItem = bag.find(
    (item) => item.variantID === getVariantIdentifier()
  );

  if (existingItem) {
    // Shows a message for 5 seconds if the item is already in the bag
    showTemporaryWarningMessage("This product is already in the bag.");
  } else {
    // Add the product to the bag with a quantity of 1
    product.quantity = 1;
    bag.push(product);
    localStorage.setItem("bag", JSON.stringify(bag));
  }

  updateAddToBagButton();
}

function checkSelectionsAndProceed(buttonType) {
  const selectedColor = document.querySelector(".color.selected");
  const selectedSize = document.querySelector(".size-option.selected");

  if (!selectedColor || !selectedSize) {
    showWarningMessage("Please select a color and size.");
    return;
  } else {
    hideWarningMessage();
  }

  const product = {
    id: productID,
    name: productTitles[0].textContent,
    image: document.querySelector("#displayed-image").src,
    color: selectedColor.dataset.color,
    size: selectedSize.dataset.size,
    price: price.textContent,
    variantID: getVariantIdentifier(),
  }; // This creates an object with all the information about the product that will be added to the bag

  let bag = JSON.parse(localStorage.getItem("bag") || "[]");
  let existingItem = bag.find((item) => item.variantID === product.variantID);

  if (buttonType === "buyNow" && existingItem) {
    // If the item is already in the bag and "Buy Now" is clicked, just proceeds
    window.location.href = "/shopping-bag.html";
    return;
  }

  addToBag(product);

  updateBagCount();

  if (buttonType === "buyNow") {
    window.location.href = "/shopping-bag.html";
  }
}

document
  .querySelector("#add-to-bag-button")
  .addEventListener("click", (event) => {
    checkSelectionsAndProceed("addToBag", productID);
  });

document.querySelector("#buy-now-button").addEventListener("click", (event) => {
  checkSelectionsAndProceed("buyNow", productID);
  event.preventDefault(); // Prevents the default behavior of the anchor tag so that it doesn't redirect to the shopping bag when no color or size is selected
});

fetchProduct();
