let bag = JSON.parse(localStorage.getItem("bag") || "[]");

document.addEventListener("DOMContentLoaded", function () {
  const bagContainer = document.querySelector(".bag-container");
  const bagTitle = document.querySelector(".bag-title");
  const bagContent = document.querySelector(".bag-content");
  const subtotalElement = document.querySelector(".subtotal-price .price");
  const totalElement = document.querySelector(".total-price .price");
  const shippingElement = document.querySelector(".shipping-price .price");
  const SHIPPING_COST = 15.0; // Hard-coded shipping cost
  let bag = JSON.parse(localStorage.getItem("bag") || "[]");

  function renderBagItems() {
    let subtotal = 0;
    let totalItems = 0;
    let bagHTML = bag
      .map((item) => {
        let itemPrice = parseFloat(item.price.replace("$", ""));
        totalItems += item.quantity;
        let itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;
        return `
                <div class="bag-item" data-id="${item.variantID}">
                <div class="bag-product-image-container">
                    <img src="${item.image}" alt="${
          item.name
        }" class="bag-product-image" />
                </div>
                    <div class="bag-product-details">
                        <div class="bag-product-title">${item.name}</div>
                          <div class="bag-product-variant">
                            <div class="variant" style="background-color: ${
                              item.color
                            }"></div>
                            <div class="variant">${item.size}</div>
                          </div>
                        <div class="bag-product-count-price">
                          <div class="bag-product-quantity">
                              <div class="bag-product-quantity-minus">-</div>
                                  ${item.quantity}
                              <div class="bag-product-quantity-plus">+</div>
                          </div>
                          <div class="price">$${itemSubtotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
    bagContent.innerHTML = bagHTML;

    // Updates order summary
    bagTitle.textContent = `Shopping Bag (${totalItems})`;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${(subtotal + SHIPPING_COST).toFixed(2)}`;
    shippingElement.textContent = `$${SHIPPING_COST.toFixed(2)}`;
  }

  bagContent.addEventListener("click", function (e) {
    let itemId;
    if (e.target.classList.contains("bag-product-quantity-minus")) {
      itemId = e.target.closest(".bag-item").dataset.id;
      adjustItemQuantity(itemId, "decrement");
    } else if (e.target.classList.contains("bag-product-quantity-plus")) {
      itemId = e.target.closest(".bag-item").dataset.id;
      adjustItemQuantity(itemId, "increment");
    }
  });

  function adjustItemQuantity(variantID, action) {
    let itemIndex = bag.findIndex((item) => item.variantID === variantID);

    if (itemIndex !== -1) {
      if (action === "increment") {
        bag[itemIndex].quantity++;
      } else if (action === "decrement") {
        if (bag[itemIndex].quantity > 1) {
          bag[itemIndex].quantity--;
        } else {
          bag.splice(itemIndex, 1); // Removes the item from the bag array
        }
      }

      localStorage.setItem("bag", JSON.stringify(bag));
      renderBagItems(); // Refresh the display

      updateBagCount();
    }
  }

  renderBagItems();
});
