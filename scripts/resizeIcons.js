const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

async function resizeIcons() {
  console.log('Resizing icons to square dimensions (1024x1024)...\n');

  try {
    // Resize icon.png
    await sharp(path.join(assetsDir, 'icon.png'))
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 30, g: 58, b: 95, alpha: 1 } // #1E3A5F
      })
      .toFile(path.join(assetsDir, 'icon-new.png'));

    // Replace original
    await sharp(path.join(assetsDir, 'icon-new.png'))
      .toFile(path.join(assetsDir, 'icon.png'));

    console.log('✓ icon.png resized to 1024x1024');

    // Resize adaptive-icon.png
    await sharp(path.join(assetsDir, 'adaptive-icon.png'))
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 30, g: 58, b: 95, alpha: 1 } // #1E3A5F
      })
      .toFile(path.join(assetsDir, 'adaptive-icon-new.png'));

    // Replace original
    await sharp(path.join(assetsDir, 'adaptive-icon-new.png'))
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    console.log('✓ adaptive-icon.png resized to 1024x1024');

    // Also update favicon and splash
    await sharp(path.join(assetsDir, 'icon.png'))
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ favicon.png updated');

    await sharp(path.join(assetsDir, 'icon.png'))
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✓ splash.png updated');

    // Clean up temp files
    const fs = require('fs');
    try {
      fs.unlinkSync(path.join(assetsDir, 'icon-new.png'));
      fs.unlinkSync(path.join(assetsDir, 'adaptive-icon-new.png'));
    } catch (e) {}

    console.log('\n✅ All icons resized successfully!');
  } catch (error) {
    console.error('Error resizing icons:', error);
    process.exit(1);
  }
}

resizeIcons();
