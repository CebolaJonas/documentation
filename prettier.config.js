module.exports = {
    printWidth: 120,
    tabWidth: 4,
    singleQuote: true,
    trailingComma: 'none',
    overrides: [
        {
            files: '*.ts',
            options: {
                tabWidth: 2,
                printWidth: 90
            }
        },
        {
            files: '*.tsx',
            options: {
                tabWidth: 2,
                printWidth: 90
            }
        }
    ]
};
