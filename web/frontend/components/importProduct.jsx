import {
  Modal,
  DataTable,
  AlphaCard,
  Scrollable,
  Stack,
  TextContainer,
  Button,
  Badge,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks";

export function ImportProductsModal({ open, onClose, onImportComplete }) {
  const fetch = useAuthenticatedFetch();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetch("/api/store-products")
        .then((response) => response.json())
        .then((data) => {
          setStoreProducts(data.products);
          setSelectedProducts([]);
        })
        .catch(() => {
          setError("Failed to load products from your store");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, fetch]);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/import-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (!response.ok) throw new Error("Import failed");

      onImportComplete();
    } catch (err) {
      setError("Failed to import selected products");
    } finally {
      setIsLoading(false);
    }
  };

  const rows = storeProducts.map((product) => [
    product.title,
    <Badge status={product.status.toLowerCase()}>{product.status}</Badge>,
    product.vendor,
    <Button
      size="slim"
      onClick={() => setSelectedProducts([...selectedProducts, product.id])}
      disabled={selectedProducts.includes(product.id)}
    >
      Select
    </Button>,
  ]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Store Products"
      primaryAction={{
        content: "Import Selected",
        onAction: handleImport,
        loading: isLoading,
        disabled: selectedProducts.length === 0,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Stack vertical spacing="tight">
          {error && (
            <Banner status="critical" onDismiss={() => setError(null)}>
              <p>{error}</p>
            </Banner>
          )}

          <TextContainer>
            <p>Select products from your store to enable AR features.</p>
          </TextContainer>

          <AlphaCard>
            <Scrollable shadow style={{ height: "350px" }}>
              {isLoading ? (
                <Stack distribution="center" spacing="loose">
                  <Spinner size="large" />
                </Stack>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Product", "Status", "Vendor", "Action"]}
                  rows={rows}
                />
              )}
            </Scrollable>
          </AlphaCard>

          {selectedProducts.length > 0 && (
            <TextContainer>
              <p>{selectedProducts.length} products selected</p>
            </TextContainer>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  );
}
