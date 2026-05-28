import { defineConfig } from 'vite'

export default defineConfig({
  base: '/sunburn/',
  build: {
    // Ship all assets as separate files. Small SVGs that use width='100%'
    // height='100%' (no intrinsic size) fail to draw to canvas when inlined
    // as data: URLs, which broke the right-eye hover animation on prod.
    assetsInlineLimit: 0,
  },
})
