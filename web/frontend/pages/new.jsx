import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  DropZone,
  Icon,
  Spinner,
} from "@shopify/polaris";
import { ViewMinor } from "@shopify/polaris-icons";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productModel, setProductModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const handleSubmit = () => {
    // Handle the form submission logic here
    navigate("/products");
  };

  const handleImageDrop = (files) => {
    setProductImage(files[0]);
  };

  const handleModelDrop = (files) => {
    setIsModelLoading(true);
    setProductModel(files[0]);
    setIsModelLoading(false);
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Product Name"
                value={productName}
                onChange={(value) => setProductName(value)}
              />
              <TextField
                label="Description"
                value={productDescription}
                onChange={(value) => setProductDescription(value)}
              />
              <DropZone onDrop={handleImageDrop}>
                <DropZone.FileUpload actionTitle="Upload product image">
                  <p>PNG, JPG, GIF up to 10MB</p>
                </DropZone.FileUpload>
              </DropZone>
              <DropZone onDrop={handleModelDrop}>
                {isModelLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Spinner size="large" />
                  </div>
                ) : (
                  <DropZone.FileUpload actionTitle="Upload 3D model">
                    <p>GLB format up to 50MB</p>
                  </DropZone.FileUpload>
                )}
              </DropZone>
              {productModel && (
                <div className="flex justify-center items-center h-64">
                  <Icon source={ViewMinor} color="primary" />
                  <span className="ml-2">3D Model Preview</span>
                </div>
              )}
              <Button primary onClick={handleSubmit}>
                Create Product
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
