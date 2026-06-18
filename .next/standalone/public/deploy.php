<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
set_time_limit(600); // 10 minutes

echo "<!DOCTYPE html><html><head><title>Deployment</title><style>body { background: #1e1e1e; color: #00ff00; font-family: monospace; padding: 20px; line-height: 1.5; }</style></head><body>";
echo "<h1>🚀 بدء تحديث النظام وإصلاح قاعدة البيانات...</h1>";
echo "<pre>";

$root_dir = dirname(__DIR__);
chdir($root_dir);
echo "Working Directory: " . getcwd() . "\n\n";

putenv("PATH=" . getenv("PATH") . ":/usr/local/bin:/usr/bin:/bin");

echo "<b>[1/4] Running: npm install</b>\n";
echo htmlspecialchars(shell_exec('npm install 2>&1')) . "\n";

echo "<b>[2/4] Running: npx prisma generate</b>\n";
echo htmlspecialchars(shell_exec('npx prisma generate 2>&1')) . "\n";

echo "<b>[3/4] Running: npx prisma db push</b>\n";
echo htmlspecialchars(shell_exec('npx prisma db push 2>&1')) . "\n";

echo "<b>[4/4] Running: npm run build</b>\n";
echo htmlspecialchars(shell_exec('npm run build 2>&1')) . "\n";

echo "<b>[5/5] Restarting Node.js App (Passenger)</b>\n";
if (!is_dir('tmp')) {
    mkdir('tmp');
}
touch('tmp/restart.txt');
echo "Restart signal sent.\n\n";

echo "<h2>✅ تم الانتهاء بنجاح! عد للموقع وجرب.</h2>";
echo "</pre></body></html>";
?>
