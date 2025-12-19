import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            animation: {
                "shell-pulse": "pulse 2s infinite",
                "shell-orbit": "orbit 6s linear infinite",
                "fusion-typing": "blink 1s infinite",
                "chart-sheen": "sheen 3s linear infinite",
                "gradient-pan": "pan 8s linear infinite",
            },
            keyframes: {
                orbit: {
                    "0%": { transform: "rotate(0deg) scale(1)" },
                    "100%": { transform: "rotate(360deg) scale(1)" },
                },
                blink: {
                    "0%, 80%, 100%": { opacity: 0.2 },
                    "40%": { opacity: 1 },
                },
                sheen: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                pan: {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
