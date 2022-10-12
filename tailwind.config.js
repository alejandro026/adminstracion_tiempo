const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {},
        screens: {
            'xs': '475px',
            ...defaultTheme.screens,
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light", "dark"],
    },
}
