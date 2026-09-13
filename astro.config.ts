export default defineConfig({
  site: 'https://tstrngt.github.io',
  base: '/portofolio',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
