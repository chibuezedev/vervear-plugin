// src/hooks/useAuthenticatedFetch.js
import { useMemo } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";

/**
 * A hook that returns an authenticated fetch function.
 * The returned fetch function includes the necessary authentication headers
 * for making requests to the app's API endpoints.
 *
 * @returns {Function} An authenticated fetch function
 */
export function useAuthenticatedFetch() {
  const app = useAppBridge();
  
  return useMemo(() => {
    const fetchFunction = authenticatedFetch(app);

    return async (uri, options) => {
      const response = await fetchFunction(uri, options);
      
      // Check if the response returned a redirect header
      if (response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
        const authUrlHeader = response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");

        if (authUrlHeader) {
          window.location.assign(authUrlHeader);
          return null;
        }
      }

      return response;
    };
  }, [app]);
}

// Export the hook as default
export default useAuthenticatedFetch;