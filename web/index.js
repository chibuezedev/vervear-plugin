// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import path from "path";
import fetch from "node-fetch";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Shopify auth setup
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

// Existing product count endpoint
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

// Get AR-enabled products
app.get("/api/ar-products", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const response = await client.get({
      path: "products",
      query: { metafield_namespaces: "ar_model" },
    });

    const products = response.body.products.map((product) => ({
      id: product.id,
      title: product.title,
      image: product.images[0]?.src,
      status: product.status,
      hasARModel: !!product.metafields?.find(
        (m) => m.namespace === "ar_model" && m.key === "model_url"
      ),
      modelUrl: product.metafields?.find(
        (m) => m.namespace === "ar_model" && m.key === "model_url"
      )?.value,
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching AR products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get store products for import
app.get("/api/store-products", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const response = await client.get({
      path: "products",
    });
    console.log("Data", response);
    res.status(200).json({ products: response.body.products });
  } catch (error) {
    console.error("Error fetching store products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product with AR capabilities
app.post("/api/products/create", async (req, res) => {
  try {
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const { title, description, price, images } = req.body;

    const productData = {
      product: {
        title,
        body_html: description,
        variants: [
          {
            price,
            inventory_management: "shopify",
            inventory_quantity: 1,
          },
        ],
        status: "active",
        images: images.map((image) => ({ src: image })),
      },
    };

    const response = await client.post({
      path: "products",
      data: productData,
    });

    res.status(201).json({ product: response.body.product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/import-products-by-tag", async (req, res) => {
  try {
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const tagToImport = "vervear";

    const response = await client.get({
      path: "products",
      query: {
        limit: 250,
      },
    });

    const productsToImport = response.body.products.filter((product) =>
      product.tags.includes(tagToImport)
    );

    // create metafields for each imported product
    const importPromises = productsToImport.map(async (product) => {
      await client.post({
        path: `products/${product.id}/metafields`,
        data: {
          metafield: {
            namespace: "ar_model",
            key: "enabled",
            value: "true",
            type: "single_line_text_field",
          },
        },
      });
    });

    await Promise.all(importPromises);

    res.status(200).json({
      success: true,
      message: `Successfully imported ${productsToImport.length} products`,
      data: productsToImport,
    });
  } catch (error) {
    console.log("Error importing products:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/update-viewer-url", async (req, res) => {
  try {
    const { productId, viewerUrl } = req.body;
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    // Save the viewer URL as a metafield for the product
   const response = await client.post({
      path: `products/${productId}/metafields`,
      data: {
        metafield: {
          namespace: "ar_viewer",
          key: "viewer_url",
          value: viewerUrl,
          type: "single_line_text_field",
        },
      },
    });

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error updating viewer URL:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/update-product-template", async (req, res) => {
  const { shopDomain, productHandle, modelPreviewLink } = req.body;

  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);

    // Retrieve the current theme
    const client = new Shopify.Clients.Rest(shopDomain, session.accessToken);
    const themes = await client.get({
      path: "themes",
    });
    const currentTheme = themes.body.themes.find(
      (theme) => theme.role === "main"
    );

    // Fetch the product template file
    const template = await client.get({
      path: `themes/${currentTheme.id}/assets`,
      query: {
        asset: { key: "templates/product.liquid" },
      },
    });

    // Update the "Apps" section with the new model preview link
    const updatedTemplate = template.body.asset.value.replace(
      "{% section 'app-section' %}",
      `{% section 'app-section' model_preview_link: '${modelPreviewLink}' %}`
    );

    // Update the modified theme file
    await client.put({
      path: `themes/${currentTheme.id}/assets`,
      data: {
        asset: {
          key: "templates/product.liquid",
          value: updatedTemplate,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error updating product template:", error);
    res.status(500).json({ error: error.message });
  }
});

// Static file serving and other middleware
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY)
    );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
