const sharp = require('sharp');
const fs = require('fs');

async function removeWhite(input, output) {
  console.log(`Processing ${input}...`);
  try {
    const { data, info } = await sharp(input)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Make white pixels transparent
    // Let's use a threshold. White is 255, 255, 255.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is white or very close to white
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Alpha to 0
      } else {
        // Simple anti-aliasing for edges (optional, but let's keep it simple first)
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(output);
    
    console.log(`Saved transparent image to ${output}`);
  } catch (err) {
    console.error(`Error processing ${input}:`, err);
  }
}

async function main() {
  await removeWhite('public/logo.png', 'public/logo.png'); // Overwrite or create new? Let's overwrite safely by using a temp file
  
  // Wait, sharp can't read and write to the same file simultaneously reliably without loading into buffer first. 
  // We read into buffer above, so `toFile` overwriting might be okay, but let's be safe:
  
  await removeWhite('public/logo.png', 'public/logo_transparent.png');
  fs.copyFileSync('public/logo_transparent.png', 'public/logo.png');
  
  // Also fix the logo used for favicon. Next.js App router uses app/favicon.ico or app/icon.png.
  // Let's generate an icon.png from it.
  await sharp('public/logo_transparent.png')
    .resize(32, 32)
    .png()
    .toFile('src/app/icon.png');
    
  await sharp('public/logo_transparent.png')
    .resize(32, 32)
    .toFormat('ico')
    .toFile('src/app/favicon.ico')
    .catch(e => console.log('Could not create ico, might not be supported directly by this sharp version.'));
    
  console.log("Done!");
}

main();
