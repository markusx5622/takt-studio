import Link from "next/link"

export default function RootNotFound() {
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
        <p style={{ fontSize: "64px", fontWeight: 700, margin: 0 }}>404</p>
        <p style={{ margin: "8px 0 24px" }}>
          Página no encontrada · Page not found
        </p>
        <Link href="/" style={{ color: "inherit" }}>
          Volver al inicio · Back to home
        </Link>
      </body>
    </html>
  )
}
