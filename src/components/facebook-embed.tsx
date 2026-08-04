"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
    };
  }
}

export function FacebookEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Facebook SDK if not already loaded
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.FB && containerRef.current) {
          window.FB.XFBML.parse(containerRef.current);
        }
      };
    } else if (window.FB && containerRef.current) {
      window.FB.XFBML.parse(containerRef.current);
    }
  }, [url]);

  return (
    <div ref={containerRef} className="fb-embed-container">
      <div
        className="fb-post"
        data-href={url}
        data-width="100%"
        data-show-text="true"
      />
      <noscript>
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Facebook Post
        </a>
      </noscript>
    </div>
  );
}
