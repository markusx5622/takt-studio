const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'CAR_5_6 - copia.xlsx');
const workbook = xlsx.readFile(filePath);

let output = '';

workbook.SheetNames.forEach(sheetName => {
    output += `\n\n=== SHEET: ${sheetName} ===\n\n`;
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Only print first 50 rows and up to 20 columns to avoid massive output if it's huge, 
    // but maybe the user wants a full analysis so I should write it to a file.
    data.forEach(row => {
        output += row.join('\t') + '\n';
    });
});

fs.writeFileSync(path.join(__dirname, 'excel_output.txt'), output);
console.log('Done reading excel to excel_output.txt');
