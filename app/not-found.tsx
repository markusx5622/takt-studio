import Link from "next/link"

export default function RootNotFound() {
  return (
    <html lang="es">
      <head>
        <style>{`
          body {
            margin: 0;
            display: flex;
            min-height: 100vh;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f1f5f9;
            background-image: radial-gradient(hsl(221.2 83.2% 53.3% / 0.05) 2px, transparent 0);
            background-size: 32px 32px;
            background-position: -1px -1px;
            color: #0f172a;
            text-align: center;
            padding: 24px;
            box-sizing: border-box;
          }
          
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            max-width: 480px;
            width: 100%;
            animation: fadeUp 300ms ease-out forwards;
          }

          @media (prefers-reduced-motion: reduce) {
            .container {
              animation: none;
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .title {
            font-size: clamp(96px, 20vw, 180px);
            font-weight: 800;
            margin: 0;
            line-height: 1;
            letter-spacing: -0.04em;
            color: #0f172a;
          }

          .subtitle {
            margin: 0;
            font-size: 16px;
            color: #0f172a99;
          }
          
          .actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 32px;
            margin-top: 16px;
          }

          .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: hsl(221.2 83.2% 53.3%);
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            outline: none;
          }

          .btn-primary:hover {
            background-color: hsl(221.2 83.2% 48%);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          .btn-primary:focus-visible {
            box-shadow: 0 0 0 2px #f1f5f9, 0 0 0 4px hsl(221.2 83.2% 53.3%);
          }
          
          .link-secondary {
            color: #0f172a99;
            font-size: 13px;
            text-decoration: underline;
            text-underline-offset: 4px;
            transition: color 0.2s ease;
            outline: none;
            border-radius: 2px;
          }
          
          .link-secondary:hover, .link-secondary:focus-visible {
            color: #0f172a;
          }

          .link-secondary:focus-visible {
            box-shadow: 0 0 0 2px #f1f5f9, 0 0 0 4px #0f172a99;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div>
            <h1 className="title">404</h1>
            <p className="subtitle">Página no encontrada · Page not found</p>
          </div>
          
          <div className="actions">
            <Link href="/" className="btn-primary">
              Volver al inicio · Back to home
            </Link>
            
            <a 
              href="https://github.com/markusx5622/takt-studio/issues" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-secondary"
            >
              Reportar problema · Report issue
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
