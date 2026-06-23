const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'logo.png');

// Read the PNG file
const buf = fs.readFileSync(inputPath);

// PNG signature check
if (buf[0] !== 0x89 || buf[1] !== 0x50) {
    console.log('Not a valid PNG');
    process.exit(1);
}

// We'll use a simple approach: use the sharp package if available, or jimp
// Try jimp first
try {
    const Jimp = require('jimp');
    Jimp.read(inputPath).then(img => {
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // If pixel is near-white, make it transparent
            if (r > 240 && g > 240 && b > 240) {
                this.bitmap.data[idx + 3] = 0; // alpha = 0
            }
        });
        img.writeAsync(inputPath).then(() => {
            console.log('✅ Background removed successfully!');
        });
    }).catch(err => console.error(err));
} catch(e) {
    console.log('jimp not found:', e.message);
}
