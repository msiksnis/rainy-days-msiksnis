const BASE_API_URL =
  "https://msiksnis-ec-dashboard.vercel.app/api/rainy-days/products";

export async function fetchProducts() {
  const url = BASE_API_URL;
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch products");
  }
}

export async function fetchProductById(productId) {
  const url = `${BASE_API_URL}/${productId}`;
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch product");
  }
}

export async function fetchFeaturedProducts() {
  try {
    const allProducts = await fetchProducts();
    return allProducts.filter((product) => product.isFeatured);
  } catch (error) {
    throw new Error("Failed to fetch featured products");
  }
}
