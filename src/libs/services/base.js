import _ from 'lodash';

let url = undefined;
let httpPrefix = 'http';
let wsPrefix = 'ws';

export function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    return response.json().then((data) => {
        const error = new Error(response.statusText);
        error.response = response;
        error.data = data;
        throw error;
    });
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
};

export function getHeaders(token) {
    const headers = {
        Authorization: `Token ${token}`,
    };
    return _.merge({}, defaultHeaders, headers);
}

export function setUrl(url_, secure = false) {
    url = url_;
    if (secure) {
        httpPrefix = 'https';
        wsPrefix = 'wss';
    }
}

export function buildGetService(path, opts = {}) {
    const dehydrate = opts.dehydrate || _.identity;
    const headers = _.merge({}, defaultHeaders, opts.headers);
    return async (cursor, extraUrlParam = '') => {
        cursor.set('status', 'Loading');
        let result = {};

        try {
            let response = await fetch(`${httpPrefix}://${url}${path}${extraUrlParam}`,
                                       { headers }).then(checkStatus);
            let data = await response.json();
            result = {
                data: dehydrate(data),
                status: 'Succeed',
            };
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
        }
        cursor.set(result);
        return result;
    };
}

export function buildPostService(path, opts = {}) {
    const method = opts.method || 'POST';
    const hydrate = opts.hydrate || JSON.stringify;
    const dehydrate = opts.dehydrate || _.identity;
    const headers = _.merge({}, defaultHeaders, opts.headers);
    return async (cursor, data) => {
        cursor.set('status', 'Loading');
        let result = {};

        const payload = {
            body: hydrate(data),
            method,
            headers,
        };

        try {
            let response = await fetch(`${httpPrefix}://${url}${path}`, payload).then(checkStatus);
            let respData = {};
            if (response.status !== 204) {
                respData = await response.json();
            }
            result = {
                data: dehydrate(respData),
                status: 'Succeed',
            };
            cursor.set(result);
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
            cursor.set('error', result.error);
            cursor.set('status', result.status);
        }
        return result;
    };
}

export function wrapItemsAsRemoteData(items) {
    return _.map(items, (data) => (
        {
            data,
            status: 'Succeed',
        })
    );
}

export function buildWebsocketService(path, handlers) {
    let socket = {
        normalClose: false,
        reconnect: false,
    };
    return (websocketStateCursor) => {
        function connect() {
            websocketStateCursor.set({ state: 'Connecting' });
            socket.ws = new WebSocket(`${wsPrefix}://${url}${path}`);

            socket.ws.onopen = () => {
                socket.normalClose = false;
                websocketStateCursor.set('state', 'Open');
                if(socket.reconnect){
                    const handler = handlers['afterReconnect'] || (() => {});
                    handler();
                }
            };

            socket.ws.onclose = () => {
                if (socket.normalClose) {
                    socket.normalClose = false;
                } else {
                    websocketStateCursor.set('state', 'Close');
                    socket.reconnect = true;
                    setTimeout(connect, 2000);
                }
            };

            socket.ws.error = (error) => {
                websocketStateCursor.set({ state: 'Failure', error: error.message });
                socket.reconnect = true;
                setTimeout(connect, 2000);
            };

            socket.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const handler = handlers[_.camelCase(data.event)] || (() => {});
                handler(data.payload);
            };
        }
        connect();
        return () => {
            socket.normalClose = true;
            socket.ws.close(1000, 'OK');
        };
    };
}
