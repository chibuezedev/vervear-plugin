// ViewerURLManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  TextField,
  ResourceList,
  ResourceItem,
  TextStyle,
  Stack,
  Banner
} from '@shopify/polaris';


export class ProductViewer {
    static async updateViewerUrl(productId, newUrl) {
      try {
        const response = await fetch("/api/update-viewer-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            viewerUrl: newUrl,
          }),
        });
  
          const data = await response.json();
          console.log(data);
  
        if (data.success) {
          const viewerContainer = document.getElementById("verve-3d-viewer");
          if (viewerContainer) {
            viewerContainer.dataset.viewerUrl = newUrl;
          }
        }
  
        return data;
      } catch (error) {
        console.error("Error in updateViewerUrl:", error);
        throw error;
      }
    }
  }
  
export default function ViewerURLManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewerUrl, setViewerUrl] = useState('');
  const [status, setStatus] = useState({ message: '', isError: false });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/import-products-by-tag');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setStatus({
        message: 'Error loading products',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewerUrlUpdate = async () => {
    if (!viewerUrl || selectedProducts.length === 0) {
      setStatus({
        message: 'Please select products and enter a viewer URL',
        isError: true
      });
      return;
    }

    try {
      const updatePromises = selectedProducts.map(productId =>
        ProductViewer.updateViewerUrl(productId, viewerUrl)
      );
      
      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every(result => result.success);
      
      setStatus({
        message: allSuccessful 
          ? 'Viewer URLs updated successfully' 
          : 'Some updates failed. Please try again.',
        isError: !allSuccessful
      });
      
      if (allSuccessful) {
        setSelectedProducts([]);
        setViewerUrl('');
        // Refresh product list to show updated status
        fetchProducts();
      }
      
    } catch (error) {
      console.error('Error updating viewer URLs:', error);
      setStatus({
        message: 'Error updating viewer URLs: ' + error.message,
        isError: true
      });
    }
  };

  return (
    <div className="p-6">
      <Card sectioned>
        <Stack vertical spacing="loose">
          {status.message && (
            <Banner
              status={status.isError ? 'critical' : 'success'}
              onDismiss={() => setStatus({ message: '', isError: false })}
            >
              {status.message}
            </Banner>
          )}
          
          <TextField
            label="3D Viewer URL"
            value={viewerUrl}
            onChange={setViewerUrl}
            placeholder="https://your-viewer-url.com/model"
            helpText="Enter the URL for the 3D viewer iframe"
          />

          <ResourceList
            resourceName={{ singular: 'product', plural: 'products' }}
            items={products}
            loading={loading}
            selectable
            selectedItems={selectedProducts}
            onSelectionChange={setSelectedProducts}
            renderItem={(item) => (
              <ResourceItem
                id={item.id}
                accessibilityLabel={`Select ${item.title}`}
              >
                <Stack>
                  <Stack.Item fill>
                    <TextStyle variation="strong">{item.title}</TextStyle>
                  </Stack.Item>
                  {item.metafields?.find(m => 
                    m.namespace === 'ar_viewer' && m.key === 'viewer_url'
                  ) && (
                    <Stack.Item>
                      <TextStyle variation="subdued">Has 3D Viewer</TextStyle>
                    </Stack.Item>
                  )}
                </Stack>
              </ResourceItem>
            )}
          />

          <Button
            primary
            onClick={handleViewerUrlUpdate}
            disabled={selectedProducts.length === 0 || !viewerUrl}
          >
            Update Viewer URL{selectedProducts.length > 1 ? 's' : ''}
          </Button>
        </Stack>
      </Card>
    </div>
  );
}