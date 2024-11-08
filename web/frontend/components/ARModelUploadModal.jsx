import {
    Modal,
    DropZone,
    Stack,
    Banner,
    ProgressBar,
    TextContainer,
    Text,
  } from "@shopify/polaris";
  import { useState, useCallback } from "react";
  import { useAuthenticatedFetch } from "../hooks";
  
  export function ARModelUploadModal({ open, onClose, product, onUploadComplete }) {
    const fetch = useAuthenticatedFetch();
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
  
    const handleDrop = useCallback((_dropFiles) => {
      setFiles(_dropFiles);
    }, []);
  
    const handleUpload = async () => {
      if (files.length === 0) return;
  
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("model", files[0]);
      formData.append("productId", product.id);
  
      try {
        const response = await fetch("/api/ar-models", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) throw new Error("Upload failed");
  
        onUploadComplete();
        onClose();
      } catch (err) {
        setError("Failed to upload AR model");
      } finally {
        setIsUploading(false);
      }
    };
  
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={`${product?.hasARModel ? "Update" : "Add"} AR Model`}
        primaryAction={{
          content: "Upload Model",
          onAction: handleUpload,
          loading: isUploading,
          disabled: files.length === 0 || isUploading,
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
              <Text as="h2" variant="headingMd">
                {product?.title}
              </Text>
              <p>Upload a 3D model file (GLB, USDZ, or GLTF format)</p>
            </TextContainer>
  
            <DropZone
              accept="model/gltf-binary,model/usd"
              errorOverlayText="File type must be GLB, USDZ, or GLTF"
              type="file"
              onDrop={handleDrop}
            >
              <DropZone.FileUpload />
            </DropZone>
  
            {isUploading && (
              <ProgressBar progress={uploadProgress} size="small" />
            )}
          </Stack>
        </Modal.Section>
      </Modal>
    );
  }