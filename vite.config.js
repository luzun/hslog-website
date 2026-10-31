import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base 用相对路径，保证既能通过 https://<user>.github.io/hslog-website/ 访问，
// 也能绑定自定义域名后直接从根路径访问。
export default defineConfig({
  base: './',
  plugins: [vue()],
})
