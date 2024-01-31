const fetch = require('node-fetch');
const WSS = require('ws');
const { events } = require('events');

function consolesocket(api, id, domain) {
    const event = new events();
    let socket = null;
    let token = null;

    async function main() {
        try {
            await authenticate();
            setWSS();
            event.emit('start');
        } catch (error) {
            event.emit('error', error.message);
        }
    }

    async function authenticate() {
        const response = await fetch(`${domain}/api/client/servers/${id}/websocket`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api}`,
                'Content-Type': 'application/json'
            }
        });

        const { token: respKey, socket: respSocket } = await response.json();
        token = respKey;
        socket = respSocket;
    }

    function setWSS() {
        const WSS = new WSS(`${domain}${socket}`, {
            origin: domain
        });

        WSS.on('open', () => {
            event.emit('WSSOpen');
            authWSS();
        });

        WSS.on('message', (data) => {
            postWSS(data);
        });

        WSS.on('error', (error) => {
            event.emit('error', error.message);
        });

        WSS.on('close', () => {
            event.emit('close', 'Connection closed by user');
        });
    }

    async function authWSS() {
        putWSS({ event: 'auth', args: [token] });
    }

    function postWSS(data) {
        try {
            const { event, args } = JSON.parse(data.toString('utf8'));

            if (event === 'stats') {
                event.emit('stats', JSON.parse(args[0]));
            } else if (event === 'token expiring') {
                authWSS();
                event.emit('tokenExpiring');
            } else {
                event.emit(event.replace(' ', '_'), args ? args[0] : undefined);
            }
        } catch (error) {
            event.emit('error', 'Error parsing WSS message.');
        }
    }

    function putWSS(packet) {
        WSS.send(JSON.stringify(packet));
    }

    function getWSS(commandText) {
        putWSS({ event: 'send command', args: [commandText] });
    }

    function power(commandText) {
        putWSS({ event: 'set state', args: [commandText] });
    }

    function close() {
        WSS.close();
        event.emit('close', 'Connection closed by user');
    }

    return {
        main,
        getWSS,
        power,
        close,
        on: event.on.bind(event),
        emit: event.emit.bind(event),
    };
}

module.exports = {
    consolesocket: consolesocket,
};
