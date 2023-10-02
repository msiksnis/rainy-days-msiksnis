document.addEventListener("DOMContentLoaded", function () {
  fetch("../../size-chart.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("size-chart-container").innerHTML = data;
    });
});
