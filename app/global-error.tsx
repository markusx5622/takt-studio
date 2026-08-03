"use client"

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f1f5f9",
          color: "#0f172a",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
          Algo ha ido mal · Something went wrong
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "24px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #0f172a33",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Reintentar · Try again
        </button>
      </body>
    </html>
  )
}
