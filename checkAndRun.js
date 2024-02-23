// checkAndRun.js
const fs = require('fs');
const { spawn } = require('child_process');

fs.access('./logs/fill.log', fs.constants.F_OK, (err) => {
    let child;
    if (err) {
        console.log('Running GetOwners and EventListeners in parallel')
        // ./logs/fill.log does not exist, run GetOwners and EventListeners in parallel
        child = spawn('ts-node', ['scripts/GetOwners.ts'], { stdio: 'inherit' });
        child = spawn('ts-node', ['scripts/EventListener.ts'], { stdio: 'inherit' });
    } else {
        console.log('Running RecoverTransfers then EventListeners')
        // ./logs/fill.log exists, run RecoverTransfers then EventListeners
        child = spawn('ts-node', ['scripts/RecoverTransfers.ts'], { stdio: 'inherit' });
        child.on('exit', function () {
            child = spawn('ts-node', ['scripts/EventListener.ts'], { stdio: 'inherit' });
        });
    }
});