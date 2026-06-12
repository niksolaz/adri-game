export default defineNuxtConfig({
  // SPA: necessario per Capacitor (nessun server)
  ssr: false,

  // DevTools disabilitati: non servono per questo progetto ed evitano dipendenze extra
  devtools: { enabled: false },

  app: {
    head: {
      title: 'Adriana e i Cuoricini',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' }
      ]
    }
  },

  // Output statico in dist/ per Capacitor
  nitro: {
    output: { publicDir: 'dist' }
  },

  compatibilityDate: '2025-07-15'
})
