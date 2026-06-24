import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'nafsi-deploy-secret-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== DEPLOY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectDir = process.cwd();

  // Run git pull + build in background, then restart
  const command = [
    `cd "${projectDir}"`,
    'git pull origin main',
    'npm install --production=false',
    'npm run build',
  ].join(' && ');

  exec(command, { timeout: 360000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      console.error('[Deploy] Build failed:', error.message);
      console.error('[Deploy] stderr:', stderr);
    } else {
      console.log('[Deploy] Build succeeded! Restarting...');
      console.log('[Deploy] stdout:', stdout);
      // Restart the process - process manager will restart it automatically
      setTimeout(() => process.exit(0), 2000);
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Deployment started! Build will take ~3-5 minutes then server restarts automatically.',
    cwd: projectDir,
  });
}
