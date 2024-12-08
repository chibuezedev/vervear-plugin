import ViewerURLManager from "../components/3d-viewer";
import { AlphaCard, Badge, Banner, Button, Card, Frame, LegacyCard, Modal, Page, Spinner, Stack, Text, TextContainer, TextField, Thumbnail } from "@shopify/polaris";
import image from '../assets/image.png'
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Index() {
  const navigate = useNavigate();
  const { productId } = useParams()
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerUrl, setViewerUrl] = useState("");
  const [url, setUrl] = useState('')
  const [active, setActive] = useState(false);

  const [src, setSrc] = useState("");

  useEffect(() => {
    // Extract the `src` if it exists
    const match = viewerUrl.match(/src="([^"]*)"/);
    if (match) {
      setSrc(match[1]);
    } else {
      setSrc("");
    }
  }, [viewerUrl]);



  const handleChange = useCallback(
    (newValue) => setViewerUrl(newValue)
  );

  const handleUpdateViewerUrl = async () => {
    // if (!viewerUrl.trim()) {
    //   setStatusMessage("Please enter a valid viewer URL.");
    //   return;
    // }
    
    try {
      const response = await fetch("/api/update-viewer-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, viewerUrl }),
      });

      const result = await response.json();
      if (response.ok) {
        // setStatusMessage("Viewer URL updated successfully.");
        console.log("Viewer URL updated successfully.")
        // toast.success("Operation successful!", {
        //   position: "top-right",
        //   autoClose: 5000, // milliseconds
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        // });
        setActive(true)

      } else {
        throw new Error(result.error || "Failed to update viewer URL.");
      }
    } catch (error) {
      console.error("Error updating viewer URL:", error);
      // setStatusMessage("Error updating viewer URL.");
    }
  };


  useEffect(() => {
    // Fetch product by ID
    setLoading(true)
    async function loadProducts() {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("Store Products", data);
        setProduct(data.product);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setStatusMessage({
          content: "Error loading products",
          error: true,
        });
      
      } finally {
        // setIsLoading(false);
      }
    }
    
      loadProducts();
    
  }, [productId]);

  const handleChangee = useCallback(() => setActive(!active), [active]);

  


  return (
    <>
     {loading ? 
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <Spinner />
              </div>
       :
    <Page 
      backAction={{
        content: 'Products',
        onAction: () => navigate('/'),
      }}
      title={product?.title}
      subtitle="All edits will only be applied to this product"
      compactTitle
      primaryAction={{content: 'Publish to product page',onAction: () => handleUpdateViewerUrl(), disabled: false}}

      // secondaryActions={[
      //   {
      //     content: 'Duplicate',
      //     accessibilityLabel: 'Secondary action label',
      //     onAction: () => alert('Duplicate action'),
      //   },
      //   {
      //     content: 'View on your store',
      //     onAction: () => alert('View on your store action'),
      //   },
      // ]}
     fullWidth>

      {/* <div style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between'}}>
        <div>
        <Text variant="heading2xl" as="h4">
          
        </Text>

            <p></p>
        </div>
          <Button
            monochrome
            // icon={IconComponent} 
            size="large"
        
          >
            Publish to product page
          </Button
          
          >
      </div> */}

     {active && <div style={{height: '0'}}>

    <Frame>
      <Modal
        // activator={activator}
        open={active}
        onClose={handleChangee}
        title="AR successfully added"
        // primaryAction={{
        //   content: 'Add Instagram',
        //   onAction: handleChange,
        // }}
        // secondaryActions={[
        //   {
        //     content: 'Learn more',
        //     onAction: handleChange,
        //   },
        // ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
             Your AR has been added to this product
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Frame>

  </div>}

  
      <Banner 
        action={{content: 'Add VerveAR App Block to your product page', url: ''}}
        // secondaryAction={{content: 'Learn more', url: ''}}
        onDismiss={() => {}}
        tone="warning"
        title="Make sure to add the VerveAR App block to your Product Page to display 3D & AR content">
        <p>To ensure your VerveAR content is displayed on your Shopify product page, make sure to add the VerveAR App Block to on your product page. This simple step enables VerveAR to display the appropriate 3D rendering based on the Shopify product connected. </p>
      </Banner>

      <div style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between', width: '100%'}}>
           <div style={{marginTop: 20, width:'60%'}}>
              <div style={{width:'100%'}}>
                      <LegacyCard sectioned>
                            <Text variant="headingLg" as="h5">
                              Paste VerveAR Product Script
                            </Text>

                            <div style={{marginTop: 10, marginBottom: 10}}>
                              <TextField
                                value={viewerUrl}
                                onChange={handleChange}
                                placeholder="https://your-viewer-url.com/model"
                                helpText="Enter the URL for the 3D viewer iframe"
                                autoComplete="off"
                              />
                            </div> 
                            {/* <p>This is where you paste the link</p> */}
                      </LegacyCard>
                </div>

                <div style={{marginTop: 20, width:'100%'}}>
                      <Card sectioned>
                            <Text variant="headingLg" as="h5">
                              Product
                            </Text>
                            <div style={{marginTop: '10px'}}>
                              <Thumbnail source={product?.images[0].src} alt={product?.title} />
                            </div>

                            <p style={{marginTop: '10px'}}>{product?.title}</p>
                            {/* <p>This is where you paste the link</p> */}
                      </Card>
                </div>
           </div>

               <div style={{marginTop: 20, width:'40%', display: 'flex', justifyContent: 'flex-end',}}>
                      <Card fullWidth sectioned>
                          <div style={{marginBottom: 10}}>
                              <Text variant="headingLg" as="h5">
                                3D Object Preview
                              </Text>
                          </div>
                          <div style={{height: '300px', width: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                          {viewerUrl ? (
                              <iframe
                                src={src}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="3D Object Viewer"
                              />
                            ) : (
                              <Text variant="bodySm" as="p">
                                Enter a valid URL to preview the 3D object.
                              </Text>
                            )}
                          </div>
                      </Card>
                </div>

      </div>
      {/* <ViewerURLManager /> */}
    </Page>}
    </>
  );
}
