import ViewerURLManager from "../components/3d-viewer";
import { Badge, Banner, Button, Card, Page, Text, TextField } from "@shopify/polaris";
import image from '../assets/image.png'

export default function Index() {
  return (
    <Page 
    backAction={{content: 'Products', url: '#'}}
      title="Book Shelf"
      subtitle="All edits will only be applied to this product"
      compactTitle
      primaryAction={{content: 'Publish to product page', disabled: false}}
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
          </Button>
      </div> */}


      <Banner 
        tone="warning"
        action={{content: 'Add VerveAR App Block to your product page', url: ''}}
        // secondaryAction={{content: 'Learn more', url: ''}}
        onDismiss={() => {}}
        title="Make sure to add the VerveAR App block to your Product Page to display 3D & AR content">
        <p>To ensure your VerveAR content is displayed on your Shopify product page, make sure to add the VerveAR App Block to on your product page. This simple step enables VerveAR to display the appropriate 3D rendering based on the Shopify product connected. </p>
      </Banner>



      <div style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between', width: '100%'}}>
           <div style={{marginTop: 20, width:'60%'}}>
              <div style={{width:'100%'}}>
                      <Card sectioned>
                            <Text variant="headingLg" as="h5">
                              Paste VerveAR Product Script
                            </Text>

                            <div style={{marginTop: 10, marginBottom: 10}}>
                              <TextField
                                // label="3D Viewer URL"
                                // value={viewerUrl}
                                // onChange={setViewerUrl}
                                placeholder="https://your-viewer-url.com/model"
                                helpText="Enter the URL for the 3D viewer iframe"
                              />
                            </div>
                           

                            {/* <p>This is where you paste the link</p> */}
                      </Card>
                </div>

                <div style={{marginTop: 20, width:'100%'}}>
                      <Card sectioned>
                            <Text variant="headingLg" as="h5">
                              Product
                            </Text>
                            <img style={{width: 60, height: 60, marginTop: 10, marginBottom: 10}} src={image} alt="" />

                            <p>Rayban Brown skylar</p>
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
                          <div style={{height: '300px'}}>
                            <iframe src="https://ar.vervear.com/3d/674b51886a00d6990d91e876" frameborder="0" width="100%" height="100%"></iframe>
                          </div>
                      </Card>
                </div>

      </div>

      
      {/* <ViewerURLManager /> */}

    </Page>
  );
}
