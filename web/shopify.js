import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import sqlite3 from "sqlite3";
import { join } from "path";


const database = new sqlite3.Database(join(process.cwd(), "database.sqlite"));
const sessionDb = new SQLiteSessionStorage(database);

const billingConfig = {
  "My Shopify One-Time Charge": {
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  apiKey: "ff8f1f0232a62880a73e6b9b010ebd2f",
  apiSecretKey: "e0325e3f1921b2a573ee6f15b66e0092",
  isEmbeddedApp: true,
  scopes: ["read_products", "write_products"],
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: billingConfig,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: sessionDb,
});

export default shopify;
