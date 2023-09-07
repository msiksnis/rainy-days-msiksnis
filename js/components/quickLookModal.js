import { fetchProductById } from "../api.js";
import { setFavoriteIcon } from "./favorite.js";
import {
  displayError,
  showTemporaryWarningMessage,
  showWarningMessage,
} from "./messages.js";

const modal = document.getElementById("quick-look-modal");
const modalContent = document.querySelector(".modal-content");
const container = document.querySelector(".container");
let allVariants = [];
let potentialVariants = [];
let selectedVariantID = null;

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

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}); // Checks if the clicked element is the modal itself and if so, closes the modal

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.style.display === "block") {
    modal.style.display = "none";
  }
}); // Checks if the escape key is pressed and if the modal is open, closes the modal

document.addEventListener("click", function (event) {
  if (event.target.matches(".quick-look-button")) {
    const productId = event.target.getAttribute("data-product-id");
    populateModal(productId)
      .then(() => {
        modal.style.display = "block";
      })
      .catch((error) => {
        document.addEventListener("click", function (event) {
          if (event.target.matches(".quick-look-button")) {
            const productId = event.target.getAttribute("data-product-id");
            populateModal(productId).then(() => {
              modal.style.display = "block";
            });
          }
        }); // This adds an event listener to the document that listens for a click on the quick look button
      });
  }
}); // This adds an event listener to the document that listens for a click on the quick look button

async function populateModal(productId) {
  try {
    const product = await fetchProductById(productId);

    allVariants = product.variants;

    let uniqueColors = [
      ...new Set(allVariants.map((variant) => variant.color.value)),
    ];
    let uniqueSizes = [
      ...new Set(allVariants.map((variant) => variant.size.value)),
    ];

    let colorOptionsHTML = uniqueColors
      .map(
        (color) =>
          `<p class="color" data-color="${color}" style="background-color:${color}"></p>`
      )
      .join("");

    let sizeOptionsHTML = uniqueSizes
      .map((size) => `<p class="size-option" data-size="${size}">${size}</p>`)
      .join("");

    const modalHTML = `
      <div class="modal-product-details-container">
        <img
          src="${product.images[0].url}"
          alt="${product.name}"
          class="modal-product-image"
        />
        <div class="modal-product-info">
          <div class="modal-product-details">
            <div class="modal-product-title-close">
              <div id="modal-product-title">${product.name}</div>
              <span class="material-icons-outlined close-modal">close</span>
            </div>
            <div id="modal-price">$${product.price}</div>
            <div class="modal-favorite-icon">
              <span class="material-icons-outlined favorite-product" data-product-id="${product.id}">
                favorite_border
              </span>
            </div>
            <div id="modal-variants">
              <div class="select-color-options">
                <div class="colors">
                  <div
                    id="modal-color-options"
                    class="modal-color-options"
                  >
                    ${colorOptionsHTML}
                  </div>
                </div>
              </div>
              <div class="select-size-options">
                <div id="modal-size-options" class="modal-size-options">
                    ${sizeOptionsHTML}
                </div>
              </div>
              <div id="warning-message-container" class="hidden" role="alert">
                <div class="variant-not-selected-alert error">
                  Please select both color and size.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-buttons">
            <button id="add-to-bag" class="buy-now">Add To Bag</button>
            <a href="product-page.html?productId=${product.id}" id="view-more" class="product-to-bag">
              View More Details
            </a>
          </div>
        </div>
      </div>
    `;

    modalContent.innerHTML = modalHTML;

    const favoriteIcon = modalContent.querySelector(".favorite-product");

    setFavoriteIcon(favoriteIcon, productId);

    const addToBagButton = document.querySelector("#add-to-bag");
    addToBagButton.addEventListener("click", (event) => {
      const productTitle = document.getElementById(
        "modal-product-title"
      ).textContent;
      const productImage = document.querySelector(".modal-product-image").src;
      const productPrice = document.getElementById("modal-price").textContent;

      checkSelectionsAndProceed(
        "addToBag",
        productId,
        productTitle,
        productImage,
        productPrice
      );
      event.preventDefault();
    });

    document.querySelector(".close-modal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    if (uniqueColors.length === 1) {
      document.querySelector(".color").classList.add("selected");
      potentialVariants = allVariants.filter(
        (v) => v.color.value === uniqueColors[0]
      );
    }

    addColorAndSizeFilterListeners();
  } catch (error) {
    container.innerHTML = displayError();
    throw error;
  }
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
        (v) => v.color.value === selectedColor
      );

      filterSizesByColor(selectedColor);
      selectedVariantID = null; // Reset selected variant since color changed
    });
  });

  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    sizeDiv.addEventListener("click", function () {
      const selectedColor = document.querySelector(".color.selected");
      if (!selectedColor && document.querySelectorAll(".color").length === 1) {
        document.querySelector(".color").classList.add("selected");
        potentialVariants = allVariants.filter(
          (v) =>
            v.color.value === document.querySelector(".color").dataset.color
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
    .filter((v) => v.color.value === selectedColor)
    .map((v) => v.size.value); // This creates an array of sizes that are available for the selected color

  document.querySelectorAll(".size-option").forEach((sizeDiv) => {
    if (!availableSizes.includes(sizeDiv.dataset.size)) {
      sizeDiv.style.display = "none";
      sizeDiv.classList.add("unavailable");
    }
  }); // This loops through all sizes and hides the ones that are not available for the selected color
}

function displayWarningMessage() {
  const container = document.querySelector("#warning-message-container");
  container.classList.remove("hidden");
}

function hideWarningMessage() {
  const container = document.querySelector("#warning-message-container");
  container.classList.add("hidden");
}

function checkSelectionsAndProceed(productId) {
  const selectedColor = document.querySelector(".color.selected");
  const selectedSize = document.querySelector(".size-option.selected");

  if (!selectedColor || !selectedSize) {
    showWarningMessage("Please select a color and size.");

    return;
  } else {
    hideWarningMessage();
  }

  // Make sure you are retrieving these values correctly
  const productTitle = document.getElementById(
    "modal-product-title"
  ).textContent;
  const productImage = document.querySelector(".modal-product-image").src;
  const productPriceText = document.getElementById("modal-price").textContent;

  // Parse the price to remove the dollar sign if necessary
  const productPrice = productPriceText.replace("$", "");

  const product = {
    id: productId,
    name: productTitle,
    image: productImage,
    color: selectedColor.dataset.color,
    size: selectedSize.dataset.size,
    price: productPrice,
    variantID: selectedVariantID,
  };

  addToBag(product);

  // Updates bag count in the header after adding item to the bag
  updateBagCount();
}
