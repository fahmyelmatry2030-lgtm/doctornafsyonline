const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacements) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    for (const [search, replace] of replacements) {
      if (content.includes(search)) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Patched', filePath);
    }
  }
}

// 1. Patch v8 in startup.js
patchFile(path.join(__dirname, 'node_modules', 'next', 'dist', 'lib', 'memory', 'startup.js'), [
  ['require("v8")', '({ setHeapSnapshotNearHeapLimit: function(){}, setFlagsFromString: function(){}, writeHeapSnapshot: function(){} })'],
  ["require('v8')", "({ setHeapSnapshotNearHeapLimit: function(){}, setFlagsFromString: function(){}, writeHeapSnapshot: function(){} })"]
]);

// 2. Patch v8 in trace.js
patchFile(path.join(__dirname, 'node_modules', 'next', 'dist', 'lib', 'memory', 'trace.js'), [
  ['require("v8")', '({ getHeapSpaceStatistics: function(){ return []; } })'],
  ["require('v8')", "({ getHeapSpaceStatistics: function(){ return []; } })"]
]);

console.log("Node modules patch complete.");
