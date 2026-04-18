const WebSocket = require('ws');
const Docker = require('dockerode');
const docker = new Docker();
const wss = new WebSocket.Server({ port: 3001 });
wss.on('connection', async (ws) => {
    console.log('New terminal session');
    try {
        const container = await docker.createContainer({
            Image: 'hashicorp/terraform:1.5.7',
            Cmd: ['/bin/sh', '-c', 'apk add --no-cache azure-cli && exec sh'],
            AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true, OpenStdin: true,
            HostConfig: { AutoRemove: true }
        });
        await container.start();
        const exec = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
        container.modem.demuxStream(exec, ws, ws);
        exec.on('end', () => ws.close());
        ws.on('message', (data) => exec.write(data));
        ws.on('close', () => { container.stop().catch(()=>{}); container.remove().catch(()=>{}); });
    } catch (err) { ws.send(`Error: ${err.message}\r\n$ `); ws.close(); }
});
console.log('WebSocket terminal server running on port 3001');
