const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

try {
    // Step 1: Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Step 2: Determine platform and create global command
    const platform = os.platform();
    const runScriptPath = path.join(__dirname, 'run.js'); 
    const binDir = path.join(__dirname, 'bin');

    // Create bin directory if it doesn't exist
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir);
    }

    const commandPath = path.join(binDir, platform === 'win32' ? 'dota2-cli.cmd' : 'dota2-cli');

    if (platform === 'win32') {
        // For Windows
        console.log('Setting up global command for Windows...');
        execSync(`echo @echo off > "${commandPath}"`);
        execSync(`echo node "${runScriptPath}" %* >> "${commandPath}"`); // Use runScriptPath
        console.log('Global command set up for Windows: dota2-cli.cmd');
    
        // Create a shortcut on the user's desktop
        const desktopPath = path.join(os.homedir(), 'Desktop', 'dota2-cli.lnk');
        
        // Create a shortcut using the command line to execute run.js directly
        execSync(`powershell "$s=(New-Object -COMObject WScript.Shell).CreateShortcut('${desktopPath}');$s.TargetPath='C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';$s.Arguments='-NoExit -Command \\"node ${runScriptPath}\\"';$s.IconLocation='${path.join(__dirname, 'icons', 'dota2.ico')}';$s.Save()"`);

        console.log('Created shortcut on desktop: dota2-cli.lnk with custom icon');
    } else {
        // For Linux/Mac
        console.log('Setting up global command for Linux/Mac...');
        execSync(`echo "#!/bin/sh\nnode '${runScriptPath}' \"\$@\"" > "${commandPath}"`); // Use runScriptPath
        execSync(`chmod +x "${commandPath}"`); // Make executable
        console.log('Global command set up for Linux/Mac: dota2-cli');
    }

    console.log('Setup complete! You can now run the CLI globally by typing:');
    console.log('dota2-cli');
} catch (error) {
    console.error('Error during setup:', error);
}
