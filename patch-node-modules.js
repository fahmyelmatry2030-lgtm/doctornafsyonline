const fs = require('fs');
const path = require('path');

const mockBody = "setHeapSnapshotNearHeapLimit: function(){}, setFlagsFromString: function(){}, writeHeapSnapshot: function(){}, getHeapStatistics: function(){ return { heap_size_limit: 4294967296, total_available_size: 4294967296, used_heap_size: 0 }; }, getHeapSpaceStatistics: function(){ return []; }, getHeapCodeStatistics: function(){ return {}; }";
const v8Mock = "new Proxy({ default: new Proxy({}, { get: function(t, p) { if (p === 'getHeapStatistics') return function(){ return { heap_size_limit: 4294967296, total_available_size: 4294967296, used_heap_size: 0 }; }; if (p === 'getHeapSpaceStatistics') return function(){ return []; }; if (p === 'getHeapCodeStatistics') return function(){ return {}; }; return function(){}; } }) }, { get: function(target, prop) { if (prop === 'default') return target.default; if (prop === 'getHeapStatistics') return function(){ return { heap_size_limit: 4294967296, total_available_size: 4294967296, used_heap_size: 0 }; }; if (prop === 'getHeapSpaceStatistics') return function(){ return []; }; if (prop === 'getHeapCodeStatistics') return function(){ return {}; }; return function(){}; } })";

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
