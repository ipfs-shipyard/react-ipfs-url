import { merge } from 'lodash';
import { useMemo, useRef, useEffect } from 'react';
import { usePromiseState } from 'react-promiseful';
import { createFileUrl, isFileUrlDisposable, disposeFileUrl } from './file-url';

export const cache = new Map();

const loadFileUrl = (ipfs, input, options) => {
    let entry = cache.get(input);

    if (entry) {
        entry.refCount += 1;
        clearTimeout(entry.revokeTimeoutId);

        return entry.promise;
    }

    const promise = createFileUrl(ipfs, input, options)
    .then((fileUrl) => {
        if (cache.get(input) === entry) {
            entry.fileUrl = fileUrl;
        }

        return fileUrl.value;
    }, (err) => {
        if (cache.get(input) === entry) {
            cache.delete(input);
        }

        throw err;
    });

    entry = {
        promise,
        refCount: 1,
        fileUrl: undefined,
        revokeTimeoutId: undefined,
    };

    cache.set(input, entry);

    return promise;
};

const unloadFileUrl = (path, options) => {
    const entry = cache.get(path);

    if (!entry) {
        return;
    }

    entry.refCount -= 1;

    if (entry.refCount !== 0) {
        return;
    }

    if (entry.fileUrl && isFileUrlDisposable(entry.fileUrl)) {
        entry.revokeTimeoutId = setTimeout(() => {
            disposeFileUrl(entry.fileUrl);
            cache.delete(path);
        }, options.disposeDelayMs);
    } else {
        cache.delete(path);
    }
};

const useIpfsUrl = (ipfs, input, options) => {
    options = useMemo(() => merge({
        strategy: 'input-first',
        checkTimeout: {
            gateway: 12500,
            infura: 12500,
            ipfsOffline: 5000,
            ipfs: 180000,
        },
        disposeDelayMs: 60000,
    }, options), [options]);

    const pathRef = useRef();
    const promiseRef = useRef();
    const optionsRef = useRef(options);

    // Fetch file if path has changed
    if (pathRef.current !== input) {
        pathRef.current = input;
        promiseRef.current = loadFileUrl(ipfs, input, options);
    }

    // Dispose previous file whenever it changes, including on unmount
    useEffect(() => () => {
        unloadFileUrl(input, optionsRef.current);
    }, [input]);

    return usePromiseState(promiseRef.current, options);
};

export default useIpfsUrl;
