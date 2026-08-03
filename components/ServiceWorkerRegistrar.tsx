"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registro fallido (navegador antiguo o contexto no seguro): la app sigue funcionando online.
    })
  }, [])

  return null
}
