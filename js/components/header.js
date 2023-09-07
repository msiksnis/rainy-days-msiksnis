function updateBagCount() {
  const bag = JSON.parse(localStorage.getItem("bag") || "[]");
  const totalItems = bag.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("bag-item-count").textContent = totalItems;
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../../header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-container").innerHTML = data;
      // After injecting the header, you can update the bag count.
      updateBagCount();
    });
});
