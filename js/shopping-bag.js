let bag = JSON.parse(localStorage.getItem("bag") || "[]");

document.addEventListener("DOMContentLoaded", function () {
  const bagContent = document.querySelector(".bag-content");
  const bagTitle = document.querySelector(".bag-title");
  const subtotalElement = document.querySelector(".subtotal-price .price");
  const totalElement = document.querySelector(".total-price .price");
  const shippingElement = document.querySelector(".shipping-price .price");
  const SHIPPING_COST = 15.0;

  function renderBagItems() {
    let subtotal = 0;
    let totalItems = 0;

    // Loopes through the bag array and renders each items to the DOM
    bag.forEach((item) => {
      const template = document
        .querySelector(".bag-item-template")
        .content.firstElementChild.cloneNode(true);
      template.dataset.id = item.variantID;
      const itemPrice = parseFloat(item.price.replace("$", ""));
      totalItems += item.quantity;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      template.querySelector(".bag-product-image").src = item.image;
      template.querySelector(".bag-product-image").alt = item.name;
      template.querySelector(".bag-product-title").textContent = item.name;
      template.querySelector(".variant").style.backgroundColor = item.color;
      template.querySelector(".variant:nth-child(2)").textContent = item.size;
      template.querySelector(".quantity-value").textContent = item.quantity;
      template.querySelector(".price").textContent = `$${itemSubtotal.toFixed(
        2
      )}`;

      bagContent.appendChild(template);
    });

    // Updates the order summary details
    bagTitle.textContent = `Shopping Bag (${totalItems})`;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${(subtotal + SHIPPING_COST).toFixed(2)}`;
    shippingElement.textContent = `$${SHIPPING_COST.toFixed(2)}`;
  }

  // Event listener to handle quantity when increment or decrement buttons are clicked
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

  // This function for recalculating the totals when the quantity is changed
  function calculateTotals() {
    let subtotal = 0;
    let totalItems = 0;

    bag.forEach((item) => {
      const itemPrice = parseFloat(item.price.replace("$", ""));
      totalItems += item.quantity;
      subtotal += itemPrice * item.quantity;
    });

    // For updating the DOM elements with the new totals
    bagTitle.textContent = `Shopping Bag (${totalItems})`;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${(subtotal + SHIPPING_COST).toFixed(2)}`;
  }

  // Function to adjust the quantity of an item
  function adjustItemQuantity(variantID, action) {
    let itemIndex = bag.findIndex((item) => item.variantID === variantID);

    if (itemIndex !== -1) {
      let item = bag[itemIndex];
      if (action === "increment") {
        item.quantity++;
      } else if (action === "decrement" && item.quantity > 1) {
        item.quantity--;
      } else if (action === "decrement" && item.quantity === 1) {
        bag.splice(itemIndex, 1);
      }

      // Updates local storage with the new bag content
      localStorage.setItem("bag", JSON.stringify(bag));

      // Updates the DOM for this specific item variant
      const itemElement = bagContent.querySelector(
        `.bag-item[data-id="${variantID}"]`
      );
      if (itemElement) {
        const updatedItem = bag.find((i) => i.variantID === variantID);
        if (!updatedItem) {
          // Removes the item from DOM if it doesn't exist in the bag (local storage) anymore
          itemElement.remove();
        } else {
          const quantityElement = itemElement.querySelector(".quantity-value");
          const priceElement = itemElement.querySelector(".price");
          quantityElement.textContent = updatedItem.quantity;
          const itemPrice = parseFloat(updatedItem.price.replace("$", ""));
          priceElement.textContent = `$${(
            itemPrice * updatedItem.quantity
          ).toFixed(2)}`;
        }
      }

      calculateTotals();
      updateBagCount();
    }
  }

  renderBagItems();
});
