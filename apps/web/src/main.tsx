import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Grind] Render crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "Inter, sans-serif",
            backgroundColor: "#F4F6F8",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: "#00A651",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <span style={{ color: "white", fontSize: 28, fontWeight: 900 }}>G</span>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "#101828", margin: "0 0 8px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.6, marginBottom: 24, maxWidth: 280 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            style={{
              backgroundColor: "#00A651",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "14px 32px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("No #root element found in index.html");

createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
