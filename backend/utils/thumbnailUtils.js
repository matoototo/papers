// thumbnailUtils.js
const { fromPath } = require('pdf2pic');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');

const generateThumbnail = async (pdfPath, thumbnailPath) => {
    try {
        const options = {
            density: 100,
            preserveAspectRatio: true,
            format: "png",
            width: 400,
            height: 400
        };

        const convert = fromPath(pdfPath, options);
        const pagePng = await convert(1, { responseType: 'buffer' });

        await sharp(pagePng.buffer)
            .webp({ quality: 80 })
            .toFile(thumbnailPath.replace('.png', '.webp'));
        return thumbnailPath.replace('.png', '.webp');

    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
    }
};

async function extractTextFromPDF(filename) {
    if (!fs.existsSync(filename)) {
        throw new Error('File not found');
    }
    const dataBuffer = fs.readFileSync(filename);
    try {
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

module.exports = {
    generateThumbnail,
    extractTextFromPDF,
};
