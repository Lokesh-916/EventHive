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
                    // tan: '#D6843C',
                    tan: '#93B1AA',
                    // legacy aliases
                    pink: '#9FEDD7',
                    orange: '#FCE181',
                },
                incident: {
                    red: '#F38181',
                    yellow: '#FCE38A',
                    green: '#EAFFD0',
                    teal: '#95E1D3',
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
