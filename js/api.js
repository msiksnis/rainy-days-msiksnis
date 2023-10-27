const BASE_API_URL = "https://www.lovetherain.no/wp-json/wc/v3/products";

const CONSUMER_KEY = "ck_6a9b803b2869b9411b06700578f43a37efb67940";
const CONSUMER_SECRET = "cs_5031ce9780568518e7b8eab2ca20fcc6b9fb98d7";

// Helper function to create an authorization header
function createAuthHeader() {
  const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
  const encodedCredentials = btoa(credentials);
  return `Basic ${encodedCredentials}`;
}

// Fetch all products
export async function fetchProducts() {
  const url = BASE_API_URL;
  const response = await fetch(url, {
    headers: {
      Authorization: createAuthHeader(),
    },
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch products");
  }
}

// Fetch a product by ID
export async function fetchProductById(id) {
  const url = `${BASE_API_URL}/${id}`;
  const response = await fetch(url, {
    headers: {
      Authorization: createAuthHeader(),
    },
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch product");
  }
}

// Fetch featured products
export async function fetchFeaturedProducts() {
  try {
    const allProducts = await fetchProducts();
    return allProducts.filter((product) => product.featured); // Note: The property name might be different in WooCommerce
  } catch (error) {
    throw new Error("Failed to fetch featured products");
  }
}
