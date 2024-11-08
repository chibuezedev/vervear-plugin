import React, { useEffect, useState } from "react";

const WebsiteEmbed = () => {
  const [iframeHeight, setIframeHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIframeHeight(window.innerHeight);
    };

    const handleMessage = (event) => {
      if (event.data.type === "resize") {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="website-embed" style={{ height: "90vh" }}>
      <iframe
        src="https://app.vervear.com"
        width="100%"
        height={iframeHeight}
        frameBorder="0"
      />
    </div>
  );
};

export default WebsiteEmbed;
