import { fetchProductById } from "./api.js";
import {
  showWarningMessage,
  hideWarningMessage,
  showTemporaryWarningMessage,
} from "./components/messages.js";
import { setFavoriteIcon } from "./components/favorite.js";

const productID = getProductIdFromUrl();
const productTitles = document.querySelectorAll("#title");
const price = document.querySelector("#price");
const colors = document.querySelector("#color");
const sizeOptions = document.querySelector(".select-size-options #size");
const loader = document.querySelector(".loader");
const title = document.querySelector("title");
const description = document.querySelector("#description");

let allVariants = []; // For all available product variants
let potentialVariants = []; // Variants that match the currently selected color
let selectedVariantID = null; // Exact variant ID based on the selected size and color

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("productId");
}

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function updateMainImage(url) {
  document.querySelector("#displayed-image").src = url;
}

async function fetchProduct() {
  toggleLoader(true);
  try {
    const product = await fetchProductById(productID);
    productDetailsCard(product);
  } catch (error) {
    errorContainer.innerHTML = message("error", error);
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
        `<img class="thumbnail" src="${image.url}" alt="${product.name}">`
    )
    .join("");

  document.querySelector(".thumbnails").innerHTML = galleryHTML;

  document.querySelectorAll(".thumbnail").forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      updateMainImage(this.src);
    });
  });

  document.querySelector("#displayed-image").src = product.images[0].url; // Sets the main image to the first image in the array

  price.textContent = `$${product.price}`;

  const favoriteIcon = document.querySelector(".favorite-product");
  favoriteIcon.setAttribute("data-product-id", product.id);

  // Checks if the product is already in the favorites list
  setFavoriteIcon(favoriteIcon, product.id);

  allVariants = product.variants; // This saves all variants to a global variable so they can be used later for filtering

  let uniqueColors = [
    ...new Set(product.variants.map((variant) => variant.color.name)),
  ]; // Creates an array of unique colors from the variants array

  let colorHTML = uniqueColors
    .map(
      (color) =>
        `<p class="color" data-color="${color}" style="background-color:${color}"></p>`
    )
    .join(""); // This creates an array of HTML elements for each color, and then joins them into a single string. The data-color attribute is used for filtering. The background-color style is used to display the color.

  colors.innerHTML = colorHTML;

  let uniqueSizes = [
    ...new Set(product.variants.map((variant) => variant.size.value)),
  ]; // Creates an array of unique sizes from the variants array

  let sizeHTML = uniqueSizes
    .map((size) => `<p class="size-option" data-size="${size}">${size}</p>`)
    .join(""); // This creates an array of HTML elements for each size, and then joins them into a single string. The data-size attribute is used for filtering.

  sizeOptions.innerHTML = sizeHTML;

  // If only one color of the product is available, it will automatically select it and filter the sizes
  if (uniqueColors.length === 1) {
    document.querySelector(".color").classList.add("selected");
    potentialVariants = allVariants.filter(
      (v) => v.color.name === uniqueColors[0]
    );
  }

  description.textContent = product.description;

  addColorAndSizeFilterListeners(); // This adds event listeners to the color and size divs so that they can be used for filtering
}

function resetAllSizes() {
  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    sizeDiv.style.display = "block";
    sizeDiv.classList.remove("selected");
    sizeDiv.classList.remove("unavailable");
  });
} // This resets all sizes to be visible and removes so that they can be filtered again if a different color is selected

function resetAllColors() {
  document.querySelectorAll(".color").forEach((colorDiv) => {
    colorDiv.classList.remove("selected");
  });
} // This removes the selected class from all colors so that they can be filtered again if a different color is selected

function filterSizesByColor(selectedColor) {
  const availableSizes = allVariants
    .filter((v) => v.color.name === selectedColor)
    .map((v) => v.size.value); // This creates an array of sizes that are available for the selected color

  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    if (!availableSizes.includes(sizeDiv.dataset.size)) {
      sizeDiv.style.display = "none";
      sizeDiv.classList.add("unavailable");
    }
  }); // This loops through all sizes and hides the ones that are not available for the selected color
}

function addColorAndSizeFilterListeners() {
  document.querySelectorAll(".color").forEach((colorDiv) => {
    colorDiv.addEventListener("click", function () {
      resetAllColors();
      this.classList.add("selected");

      resetAllSizes();
      const selectedColor = this.dataset.color;

      // Store potential variants that match the selected color
      potentialVariants = allVariants.filter(
        (v) => v.color.name === selectedColor
      );

      filterSizesByColor(selectedColor);
      selectedVariantID = null; // Resets selected variant if color was changed
    });
  });

  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    sizeDiv.addEventListener("click", function () {
      const selectedColor = document.querySelector(".color.selected");
      if (!selectedColor && document.querySelectorAll(".color").length === 1) {
        document.querySelector(".color").classList.add("selected");
        potentialVariants = allVariants.filter(
          (v) => v.color.name === document.querySelector(".color").dataset.color
        );
      }
      if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        selectedVariantID = null; // Reset selected variant since size was deselected
      } else {
        document
          .querySelectorAll(".size-option.selected")
          .forEach((selectedSize) => {
            selectedSize.classList.remove("selected");
          });

        this.classList.add("selected");

        // Determine the selected variant ID based on the selected size
        const selectedSize = this.dataset.size;
        const variant = potentialVariants.find(
          (v) => v.size.value === selectedSize
        );
        if (variant) {
          selectedVariantID = variant.id;
        }
      }

      if (selectedColor && this.classList.contains("selected")) {
        hideWarningMessage();
      }
    });
  });
}

function addToBag(product) {
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");

  let existingItem = bag.find((item) => item.variantID === product.variantID); // Checks if the product variant is already in the bag

  if (existingItem) {
    // Show a message if the item is already in the bag
    showTemporaryWarningMessage("This product is already in the bag.");
  } else {
    // Add the product to the bag with a quantity of 1
    product.quantity = 1;
    bag.push(product);
    localStorage.setItem("bag", JSON.stringify(bag));
  }
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
    variantID: selectedVariantID,
  }; // This creates an object with all the information about the product that will be added to the bag

  let bag = JSON.parse(localStorage.getItem("bag") || "[]");
  let existingItem = bag.find((item) => item.variantID === product.variantID);

  if (buttonType === "buyNow" && existingItem) {
    // If the item is already in the bag and "Buy Now" is clicked, just proceed
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
    checkSelectionsAndProceed("addToBag");
  });

document.querySelector("#buy-now-button").addEventListener("click", (event) => {
  checkSelectionsAndProceed("buyNow");
  event.preventDefault(); // Prevents the default behavior of the anchor tag so that it doesn't redirect to the shopping bag when no color or size is selected
});

fetchProduct();
