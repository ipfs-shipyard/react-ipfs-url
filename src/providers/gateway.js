const URL_REGEXP = /^https?:\/\/[^/]+\/(ip(?:f|n)s)\/(?:(\w+)\b)/;

export default {
    name: 'gateway',

    parse(input) {
        const match = input.match(URL_REGEXP);

        if (!match) {
            return;
        }

        return `/${match[1]}/${match[2]}`;
    },

    check(input) {
        const abortController = new AbortController();

        const promise = fetch(input, {
            method: 'HEAD',
            mode: 'cors',
            signal: abortController.signal,
        })
        .then((response) => response.status === 200);

        promise.cancel = () => abortController.abort();

        return promise;
    },

    async createUrl(input) {
        return input;
    },
};
