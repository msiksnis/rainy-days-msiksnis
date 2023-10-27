import { fetchProductById } from "../api.js";
import { setFavoriteIcon } from "./favorite.js";
import {
  displayError,
  showTemporaryWarningMessage,
  showWarningMessage,
  hideWarningMessage,
} from "./messages.js";

const modal = document.getElementById("quick-look-modal");
const modalContent = document.querySelector(".modal-content");
const container = document.querySelector(".container");
const loader = document.querySelector(".loader");

function getVariantIdentifier(productID) {
  const selectedColor = document.querySelector(".color.selected");
  const selectedSize = document.querySelector(".size-option.selected");
  if (selectedColor && selectedSize) {
    return `${productID}-${selectedColor.dataset.color}-${selectedSize.dataset.size}`;
  }
  return null;
}

function updateAddToBagButton(productID) {
  const addToBagButton = document.querySelector("#add-to-bag");
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");
  let existingItem = bag.find(
    (item) => item.variantID === getVariantIdentifier(productID)
  );

  if (existingItem) {
    addToBagButton.textContent = "Product is in the Bag";
    addToBagButton.classList.add("item-in-bag"); // This is an extra class that is used to style the button differently when the product is already in the bag
  } else {
    addToBagButton.textContent = "Add to Bag";
    addToBagButton.classList.remove("item-in-bag");
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
    const productID = event.target.getAttribute("data-product-id");
    populateModal(productID)
      .then(() => {
        modal.style.display = "block";
      })
      .catch((error) => {
        console.log(error);
        document.addEventListener("click", function (event) {
          if (event.target.matches(".quick-look-button")) {
            const productID = event.target.getAttribute("data-product-id");
            populateModal(productID).then(() => {
              modal.style.display = "block";
            });
          }
        });
      });
  }
}); // Adds an event listener to the document that listens for a click on the quick look button

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

async function populateModal(productID) {
  toggleLoader(true);
  try {
    const product = await fetchProductById(productID);
    let colorAttr = product.attributes.find((attr) => attr.name === "Color");
    let sizeAttr = product.attributes.find((attr) => attr.name === "Size");

    let uniqueColors = colorAttr ? colorAttr.options : [];
    let uniqueSizes = sizeAttr ? sizeAttr.options : [];

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
      <span class="material-icons-outlined close-modal-mobile mobile">close</span>
        <img
          src="${product.images[0].src}"
          alt="${product.name}"
          class="modal-product-image"
        />
        <div class="modal-product-info">
          <div class="modal-product-details">
            <div class="modal-product-title-close">
              <div id="modal-product-title">${product.name}</div>
              <span class="material-icons-outlined close-modal desktop">close</span>
            </div>
            <div id="modal-price">$${product.regular_price}</div>
            <div class="modal-favorite-icon">
              <span class="material-icons-outlined favorite-product" data-product-id="${product.id}">
                favorite_border
              </span>
            </div>
            <div id="modal-variants">
              <div class="select-color-options">
              <div class="color-name"></div>
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
          <div class="product-page-buttons">
            <button id="add-to-bag" class="product-to-bag">Add To Bag</button>
            <a href="product-page.html?productId=${product.id}" id="view-more" class="buy-now">
              View More Details
            </a>
          </div>
        </div>
      </div>
    `;

    modalContent.innerHTML = modalHTML;

    const favoriteIcon = modalContent.querySelector(".favorite-product");

    setFavoriteIcon(favoriteIcon, productID);

    const addToBagButton = document.querySelector("#add-to-bag");
    addToBagButton.addEventListener("click", (event) => {
      checkSelectionsAndProceed(
        product.id,
        product.name,
        product.images[0].src,
        `$${product.regular_price}`
      );
      event.preventDefault(); // Prevents the default action

      event.preventDefault(); // Prevents the default action
    });

    document.querySelector(".close-modal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    document
      .querySelector(".close-modal-mobile")
      .addEventListener("click", () => {
        modal.style.display = "none";
      });

    // If only one color of the product is available, it will automatically select that color
    if (uniqueColors.length === 1) {
      document.querySelector(".color").classList.add("selected");
      const colorNameElement = document.querySelector(".color-name");
      colorNameElement.textContent = `Color: ${uniqueColors[0]}`;
    }

    if (uniqueColors.length === 1) {
      const singleColorDiv = document.querySelector(".color");
      singleColorDiv.classList.add("selected");
      const colorNameElement = document.querySelector(".color-name");
      colorNameElement.textContent = `Color: ${singleColorDiv.dataset.color}`;
    }

    updateAddToBagButton(productID);
  } catch (error) {
    console.log(error);
    container.innerHTML = displayError();
  } finally {
    toggleLoader(false);
  }

  addSelectionListeners();
  updateAddToBagButton(productID);
}

function updateButton() {
  const productID = document
    .querySelector(".quick-look-button")
    .getAttribute("data-product-id");
  updateAddToBagButton(productID);
}

function addSelectionListeners() {
  document.querySelectorAll(".color").forEach((colorDiv) => {
    colorDiv.addEventListener("click", function () {
      document.querySelectorAll(".color.selected").forEach((selectedColor) => {
        selectedColor.classList.remove("selected");
      });
      this.classList.add("selected");
      updateButton();
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
      updateButton();
    });
  });
}

function checkSelectionsAndProceed(
  productID,
  productTitle,
  productImage,
  productPrice
) {
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
    name: productTitle,
    image: productImage,
    color: selectedColor.dataset.color,
    size: selectedSize.dataset.size,
    price: productPrice,
    variantID: getVariantIdentifier(productID),
  };

  addToBag(product);

  updateBagCount();
}

function addToBag(product) {
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");

  console.log("this is local storage bag MODAL", bag);

  let existingItem = bag.find(
    (item) =>
      item.id === product.id &&
      item.color === product.color &&
      item.size === product.size
  );

  if (existingItem) {
    showTemporaryWarningMessage("This product is already in the bag.");
  } else {
    product.quantity = 1;
    bag.push(product);
    localStorage.setItem("bag", JSON.stringify(bag));
  }

  updateAddToBagButton(product.id);
}
