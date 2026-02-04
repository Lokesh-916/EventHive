/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html"],
    theme: {
        extend: {
            colors: {
                eh: {
                    teal: '#026670',
                    mint: '#9FEDD7',
                    cream: '#EDEAE5',
                    yellow: '#FCE181',
                    pale: '#FEF9C7',
                    // legacy aliases
                    pink: '#9FEDD7',
                    orange: '#FCE181',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                brand: ['Satisfy', 'cursive'],
            },
        },
    },
    plugins: [],
};
