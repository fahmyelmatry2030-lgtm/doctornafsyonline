const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const https = require('https');

cloudinary.config({ 
  cloud_name: 'dik45g11h', 
  api_key: '117826882361358', 
  api_secret: 'TNJc7H0os2loOPsXE6dLTOU854c' 
});

async function run() {
  try {
    const publicId = 'nafsi/contracts/cmr3bhmw30000d7hx1twy4ni5/1782985707167_trial_contract';
    
    // Get asset details
    const details = await cloudinary.api.resource(publicId, { resource_type: 'image' });
    console.log('Asset details:', details.secure_url);

    // Try to get download URL
    const url = cloudinary.utils.private_download_url(publicId, 'pdf', { resource_type: 'image' });
    console.log('Signed download URL:', url);
    
    // Let's test if we can download it
    https.get(url, (res) => {
      console.log('Status:', res.statusCode);
      if (res.statusCode === 200) {
        console.log('Success! We can download it using signed URL.');
      }
    });

  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

run();
