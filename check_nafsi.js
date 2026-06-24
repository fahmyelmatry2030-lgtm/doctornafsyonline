const fs = require('fs');
const path = require('path');

const arJsonPath = path.join(__dirname, 'messages', 'ar.json');
let arJson = fs.readFileSync(arJsonPath, 'utf8');

// Replace "منصة نفسي" with "منصة دكتور نفسي"
arJson = arJson.replace(/منصة نفسي/g, 'منصة دكتور نفسي');

// Replace isolated "نفسي" that are not preceded by "دكتور "
// We will use a regex with a negative lookbehind if supported, or just do it manually.
arJson = arJson.replace(/(?<!دكتور\s)(?<!دكتور\s+)نفسي/g, 'دكتور نفسي');

// Also, clean up any potential "دكتور دكتور نفسي" just in case
arJson = arJson.replace(/دكتور\s+دكتور\s+نفسي/g, 'دكتور نفسي');

// Replace "طبيب نفسي" or "أخصائي نفسي" with "أخصائي دكتور نفسي" ?? No, "أخصائي نفسي" is "Psychologist", it should remain "أخصائي نفسي". 
// Wait, the user said "وغير كلمه نفسي دي خليها دكتور نفسي". They might mean the platform name.
// Let's print out all occurrences of "نفسي" with their context before replacing to be sure.

const lines = arJson.split('\n');
lines.forEach((line, i) => {
    if (line.includes('نفسي')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
});
