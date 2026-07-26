"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <div style={contentStyle}>
            <h1 style={headingStyle}>Critical Error</h1>
            <p style={textStyle}>
              The application encountered a critical error. Please refresh the page.
            </p>
          </div>
          <button
            onClick={() => reset()}
            style={buttonStyle}
          >
            Refresh page
          </button>
        </div>
      </body>
    </html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  textAlign: "center",
  padding: "32px",
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: 700,
  letterSpacing: "-0.025em",
  margin: 0,
  color: "#111",
};

const textStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  color: "#666",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#000",
  color: "#fff",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};
