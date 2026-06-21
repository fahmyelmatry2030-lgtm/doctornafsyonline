<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
set_time_limit(600); // 10 minutes

echo '<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مركز نشر وإدارة منصة دكتور نفسي أونلاين</title>
    <style>
        body {
            background-color: #0f172a;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 40px 20px;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .container {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            padding: 40px;
            max-width: 650px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            text-align: center;
        }
        h1 {
            color: #6366f1;
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 8px;
        }
        p.subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .status-box {
            background-color: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 25px;
            font-family: monospace;
            font-size: 13px;
            text-align: left;
            direction: ltr;
            max-height: 250px;
            overflow-y: auto;
            color: #38bdf8;
            border-left: 4px solid #6366f1;
        }
        .alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 20px;
            border-radius: 16px;
            font-size: 13px;
            text-align: right;
            line-height: 1.6;
            margin-top: 15px;
        }
        .alert-title {
            font-weight: 800;
            margin-bottom: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .btn {
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 15px;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
<div class="container">
    <h1>🚀 مركز نشر التحديثات</h1>
    <p class="subtitle">منصة دكتور نفسي أونلاين</p>';

$root_dir = dirname(__DIR__);
chdir($root_dir);

echo '<div class="status-box">';
echo "Working Directory: " . htmlspecialchars(getcwd()) . "\n\n";

if (!function_exists('shell_exec')) {
    echo "⚠️ shell_exec is disabled on this server.\n";
    echo "</div>";
    
    echo '
    <div class="alert">
        <div class="alert-title">⚠️ وظيفة التحديث التلقائي معطلة على السيرفر</div>
        شركة الاستضافة (Hostinger) قامت بتعطيل تشغيل الأوامر المباشرة عبر المتصفح لدواعي الأمان. لتطبيق التحديثات الحالية:
        <ul style="margin: 8px 0 0 0; padding-right: 20px;">
            <li>اذهب إلى لوحة تحكم <b>Hostinger</b> ثم اختر قسم <b>Git</b> واضغط على <b>Deploy</b> أو <b>Pull</b>.</li>
            <li>ثم اذهب إلى قسم <b>Node.js</b> واعمل <b>Stop</b> ثم <b>Start</b> لإعادة تشغيل السيرفر وتفعيل الكود الجديد.</li>
        </ul>
    </div>';
} else {
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
    echo "</div>";
    
    echo '<h2 style="color: #4ade80; font-size: 18px; font-weight: 800;">✅ تم تحديث ونشر المنصة بنجاح!</h2>';
    echo '<a href="/" class="btn">ذهاب للموقع الرئيسي</a>';
}

echo '</div></body></html>';
?>

