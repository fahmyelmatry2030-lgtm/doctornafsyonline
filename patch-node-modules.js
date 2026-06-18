const fs = require('fs');
const path = require('path');

const mockBody = "setHeapSnapshotNearHeapLimit: function(){}, setFlagsFromString: function(){}, writeHeapSnapshot: function(){}, getHeapStatistics: function(){ return { heap_size_limit: 4294967296, total_available_size: 4294967296, used_heap_size: 0 }; }, getHeapSpaceStatistics: function(){ return []; }, getHeapCodeStatistics: function(){ return {}; }";
const v8Mock = `({ ${mockBody}, default: { ${mockBody} } })`;

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'node_modules', 'next'), function(filePath) {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('require("v8")') || content.includes("require('v8')")) {
      content = content.replace(/require\("v8"\)/g, v8Mock).replace(/require\('v8'\)/g, v8Mock);
      fs.writeFileSync(filePath, content);
      console.log('Patched', filePath);
    }
  }
});
console.log("Global v8 patch complete.");
