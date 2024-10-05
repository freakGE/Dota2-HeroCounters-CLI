const readline = require('readline');
const { execSync } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.question('Enter flags (e.g., -items -heroes): ', (flags) => {
    const scriptPath = path.join(__dirname, 'src', 'index.js');
    
    const command = `node "${scriptPath}" ${flags}`;

    console.log(`>> ${command}`);

    try {
        const output = execSync(command, { stdio: 'inherit' });
        console.log(`Command executed successfully.\nOutput:\n${output}`);
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
    }

    rl.close();
});
