import pDelay from 'delay';
import { parse as parseQueryString } from 'query-string';

export const INFURA_IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0/';

export const getHashFromUrl = (url) => {
    if (!url.startsWith('https://ipfs.infura.io:5001/api/')) {
        return undefined;
    }

    const parsedQueryString = parseQueryString((new URL(url)).search);

    return parsedQueryString.arg;
};

export const getCatUrl = (hash) => `${INFURA_IPFS_ENDPOINT}cat?arg=${hash}`;

export const fileExists = async (url, timeout) => {
    const abortController = new AbortController();

    const exists = await Promise.race([
        pDelay(timeout).then(() => false),
        fetch(url, {
            method: 'GET',
            mode: 'cors',
            signal: abortController.signal,
        })
        .then((response) => response.status === 200),
    ]);

    abortController.abort();

    return exists;
};
