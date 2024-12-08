import {
  AlphaCard,
  ResourceList,
  Thumbnail,
  Stack,
  ButtonGroup,
  Button,
  Text,
  Badge,
} from "@shopify/polaris";
import { useState } from "react";
import { ARModelUploadModal } from "./ARModelUploadModal";

export function ProductList({ products, onUpdate }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isARModalOpen, setIsARModalOpen] = useState(false);

  const renderItem = (item) => {
    const { id, title, image, hasARModel, status } = item;
    const media = (
      <Thumbnail source={image || "placeholder-image.png"} alt={title} />
    );

    return (
      <ResourceList.Item
        id={id}
        media={media}
        accessibilityLabel={`View details for ${title}`}
      >
        <Stack>
          <Stack.Item fill>
            <Text variant="bodyMd" fontWeight="bold">
              {title}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Badge status={hasARModel ? "success" : "attention"}>
              {hasARModel ? "AR Ready" : "No AR Model"}
            </Badge>
          </Stack.Item>
          <Stack.Item>
            <ButtonGroup>
              <Button
                size="slim"
                onClick={() => {
                  setSelectedProduct(item);
                  setIsARModalOpen(true);
                }}
              >
                {hasARModel ? "Update AR Model" : "Add AR Model"}
              </Button>
            </ButtonGroup>
          </Stack.Item>
        </Stack>
      </ResourceList.Item>
    );
  };

  return (
    <>
      <AlphaCard>
        <ResourceList
          resourceName={{ singular: "product", plural: "products" }}
          items={products}
          renderItem={renderItem}
        />
      </AlphaCard>

      <ARModelUploadModal
        open={isARModalOpen}
        onClose={() => {
          setIsARModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onUploadComplete={onUpdate}
      />
    </>
  );
}
