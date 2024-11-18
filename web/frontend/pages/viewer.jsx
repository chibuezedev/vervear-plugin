import ViewerURLManager from "../components/3d-viewer";
import { Page } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="3D Viewer Management">
      <ViewerURLManager />
    </Page>
  );
}
