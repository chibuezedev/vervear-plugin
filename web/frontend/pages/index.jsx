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
  Card,
  Heading,
  ButtonGroup,
  CalloutCard,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ImportProductsModal } from "../components/importProduct";
import { ProductList } from "../components/productList";
import { SimpleIndexTableExample } from "../components/Product";
import IndexFiltersDefaultExample from "../components/Table";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      const response = await fetch("/api/import-products-by-tag", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Store Products", data);
      setProducts(data.data);
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
    <Page fullWidth>
      <div style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between'}}>
        <div>
        <Text variant="heading2xl" as="h4">
          VerveAR 3D, AR & Virtual Try-On
        </Text>

            <p>Start transforming your online store experience by adding 3D & AR to your product catalog</p>
        </div>
          <Button
            monochrome
            // icon={}
            size="large"
        
          >
            Go to VerveAR Studio
          </Button>
      </div>
      <div style={{marginBottom: 20}}>
        <CalloutCard
              title="Welcome to your VerveAR dashboard"
              illustration="./assets/Illustration.svg"
              primaryAction={{
                content: 'Watch Tutorial',
                url: '#',
              }}
              secondaryAction={{content: 'Schedule a demo', url: ''}}
            >
              <p> Your VerveAR app is all set to elevate your Shopify store to the next level with
                3D, Augmented Reality (AR), and Virtual Try-On shopping experiences. Here you will
                be able to embed 3D, AR, or Virtual Try-On Shopping experience for any product on
                your website.</p>
          </CalloutCard>
      </div>

      <Layout>
        {/* {statusMessage && (
          <Layout.Section>
            <Banner
              status={statusMessage.error ? "critical" : "success"}
              onDismiss={() => setStatusMessage(null)}
            >
              <p>{statusMessage.content}</p>
            </Banner>
          </Layout.Section>
        )} */}
        <Layout.Section>
          {isLoading ? (
            <AlphaCard sectioned>
              <Stack distribution="center">
                <Spinner />
              </Stack>
            </AlphaCard>
          ) : products.length > 0 ? (
            // <ProductList products={products} onUpdate={loadProducts} />
            // <SimpleIndexTableExample products={products} onUpdate={loadProducts} />
            <IndexFiltersDefaultExample products={products} onUpdate={loadProducts} />
          ) : (
            <AlphaCard sectioned>
              <EmptyState
                heading="Add 3D, AR & Virtual Try-On to your product page"
                action={{
                  content: "Add tag to products",
                  onAction: () => setIsImportModalOpen(true),
                }}
                secondaryAction={{
                  content: "Watch Tutorial",
                  onAction: () => navigate("/new"),
                }}
                image="./assets/emptys.svg"
              >
                <p>
                To get started you will need to add a simple tag “vervear” to any 
                product on your online store and it will appear in the VerveAR app. 
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
