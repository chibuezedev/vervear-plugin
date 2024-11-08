import { useNavigate } from "react-router-dom";
import {
  AlphaCard,
  Page,
  Layout,
  TextContainer,
  Button,
  Stack,
  Banner,
  EmptyState,
  Spinner,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ImportProductsModal } from "../components/importProduct";
import { ProductList } from "../components/productList";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let timeoutId;

    if (statusMessage) {
      timeoutId = setTimeout(() => {
        setStatusMessage(null);
      }, 10000); // 10 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [statusMessage]);

  async function loadProducts() {
    try {
      const response = await fetch("/api/ar-products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      setStatusMessage({
        content: "Error loading products",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleImportComplete = async () => {
    setIsImportModalOpen(false);
    setStatusMessage({
      content: "Products imported successfully!",
      error: false,
    });
    await loadProducts();
  };

  const primaryActions = [
    {
      content: "Create New Product",
      onAction: () => navigate("/new"),
    },
    {
      content: "Import Store Products",
      onAction: () => setIsImportModalOpen(true),
    },
  ];

  return (
    <Page narrowWidth>
      <TitleBar title="AR Product Management" primaryAction={primaryActions} />

      <Layout>
        {statusMessage && (
          <Layout.Section>
            <Banner
              status={statusMessage.error ? "critical" : "success"}
              onDismiss={() => setStatusMessage(null)}
            >
              <p>{statusMessage.content}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <AlphaCard sectioned>
            <Stack vertical spacing="loose">
              <TextContainer>
                <Text as="h2" variant="headingMd">
                  Welcome to AR Product Management
                </Text>
                <p>
                  Enhance your products with AR/VR experiences. Import your
                  existing products or create new ones to get started.
                </p>
              </TextContainer>

              <Stack distribution="trailing">
                <Button onClick={() => navigate("/new")}>
                  Create Product
                </Button>
                <Button primary onClick={() => setIsImportModalOpen(true)}>
                  Import Products
                </Button>
              </Stack>
            </Stack>
          </AlphaCard>
        </Layout.Section>

        <Layout.Section>
          {isLoading ? (
            <AlphaCard sectioned>
              <Stack distribution="center">
                <Spinner />
              </Stack>
            </AlphaCard>
          ) : products.length > 0 ? (
            <ProductList products={products} onUpdate={loadProducts} />
          ) : (
            <AlphaCard sectioned>
              <EmptyState
                heading="Add AR to your products"
                action={{
                  content: "Import Products",
                  onAction: () => setIsImportModalOpen(true),
                }}
                secondaryAction={{
                  content: "Create Product",
                  onAction: () => navigate("/new"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Start by importing your existing products or create new ones.
                </p>
              </EmptyState>
            </AlphaCard>
          )}
        </Layout.Section>
      </Layout>

      <ImportProductsModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </Page>
  );
}
