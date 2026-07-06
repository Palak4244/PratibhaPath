export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050B18",
        card: "#0D1425",
        cyan: { DEFAULT: "#22D3EE", dark: "#06B6D4" },
        teal: "#2DD4BF",
        violet: "#818CF8",
        rose: "#FB7185",
        amber: "#FBBF24",
        slate: { DEFAULT: "#94A3B8", dark: "#64748B" },
        line: "#1E293B",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
