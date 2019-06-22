import { parse as parseQueryString } from 'query-string';

const INFURA_IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0/';

export default {
    name: 'infura',

    parse(input) {
        if (!input.startsWith('https://ipfs.infura.io:5001/api/')) {
            return;
        }

        const parsedQueryString = parseQueryString((new URL(input)).search);

        return `/ipfs/${parsedQueryString.arg}`;
    },

    check(input, ipfsPath) {
        const abortController = new AbortController();

        const [, , hash] = ipfsPath.split('/');

        const promise = fetch(`${INFURA_IPFS_ENDPOINT}block/stat?arg=${hash}`, {
            method: 'GET',
            mode: 'cors',
            signal: abortController.signal,
        })
        .then((response) => response.status === 200)
        .catch(() => false);

        promise.cancel = () => abortController.abort();

        return promise;
    },

    async createUrl(input, ipfsPath) {
        const [, , hash] = ipfsPath.split('/');

        return `${INFURA_IPFS_ENDPOINT}cat?arg=${hash}`;
    },
};
