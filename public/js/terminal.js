const term = new Terminal({ cursorBlink: true, fontSize: 14 });
term.open(document.getElementById('terminal-container'));
term.write('\x1b[1;32mWelcome to Terraform Sandbox!\x1b[0m\r\n$ ');
let ws;
function connectWebSocket() {
    ws = new WebSocket('ws://localhost:3001');
    ws.onopen = () => console.log('Terminal connected');
    ws.onmessage = (e) => term.write(e.data);
    ws.onclose = () => { term.write('\r\n\x1b[31mDisconnected. Reconnecting...\x1b[0m\r\n'); setTimeout(connectWebSocket, 3000); };
    ws.onerror = () => {};
}
connectWebSocket();
term.onData(data => { if (ws && ws.readyState === WebSocket.OPEN) ws.send(data); else term.write('\r\n\x1b[31mTerminal not ready.\x1b[0m\r\n$ '); });
