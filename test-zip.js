const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dik45g11h', 
  api_key: '117826882361358', 
  api_secret: 'TNJc7H0os2loOPsXE6dLTOU854c' 
});

const url = cloudinary.utils.download_zip_url({
  public_ids: ['nafsi/contracts/cmr0zr7gx0000qdjlc4la6jdi/1782865658750________________2'],
  resource_type: 'image'
});

console.log(url);
