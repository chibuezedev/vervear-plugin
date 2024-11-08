import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
];

export const DEFAULT_PRODUCTS_COUNT = 5;

// Simplified mutation with only required fields
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  const createdProducts = [];
  const errors = [];

  try {
    for (let i = 0; i < count; i++) {
      const title = randomTitle();
      try {
        const response = await client.request(CREATE_PRODUCTS_MUTATION, {
          variables: {
            input: {
              title: title,
              status: "DRAFT",
            },
          },
        });

        if (response.data.productCreate.userErrors.length > 0) {
          const error = response.data.productCreate.userErrors[0];
          throw new Error(`GraphQL user error: ${error.message}`);
        }

        createdProducts.push(response.data.productCreate.product);
        console.log(`Created product: ${title}`);
      } catch (error) {
        console.error(`Failed to create product ${title}:`, error);
        errors.push({
          title,
          error: error.message,
        });
      }
    }

    // If no products were created successfully, throw an error
    if (createdProducts.length === 0) {
      throw new Error(
        `Failed to create any products. Errors: ${JSON.stringify(errors)}`
      );
    }

    return {
      success: true,
      created: createdProducts.length,
      products: createdProducts,
      errors: errors,
    };
  } catch (error) {
    console.error("Product creation failed:", error);

    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `GraphQL Error: ${error.message}\nResponse: ${JSON.stringify(
          error.response,
          null,
          2
        )}`
      );
    }

    throw error;
  }
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}
