import { useMemo, useRef, useEffect } from 'react';
import { usePromiseState } from 'react-promiseful';
import { getFileUrl, isFileUrlDisposable, disposeFileUrl } from './utils/file-url';

export const cache = new Map();

const loadFileUrl = (ipfs, path, options) => {
    let entry = cache.get(path);

    if (entry) {
        entry.refCount += 1;
        clearTimeout(entry.revokeTimeoutId);

        return entry.promise;
    }

    const promise = getFileUrl(ipfs, path, options)
    .then((fileUrl) => {
        if (cache.get(path) === entry) {
            entry.fileUrl = fileUrl;

            return fileUrl.value;
        }
    }, (err) => {
        if (cache.get(path) === entry) {
            cache.delete(path);
            throw err;
        }
    });

    entry = {
        promise,
        refCount: 1,
        fileUrl: undefined,
        revokeTimeoutId: undefined,
    };

    cache.set(path, entry);

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
        }, options.disposeDelayMs);
    } else {
        cache.delete(path);
    }
};

const useIpfsBlob = (ipfs, path, options) => {
    options = useMemo(() => ({
        timeout: 3 * 60000,
        infuraTimeout: 15000,
        disposeDelayMs: 60000,
        ...options,
    }), [options]);

    const pathRef = useRef();
    const promiseRef = useRef();
    const optionsRef = useRef(options);

    optionsRef.current = options;

    // Fetch file if path has changed
    if (pathRef.current !== path) {
        pathRef.current = path;
        promiseRef.current = loadFileUrl(ipfs, path, options);
    }

    // Dispose previous file whenever it changes, including on unmount
    useEffect(() => () => {
        unloadFileUrl(path, optionsRef.current);
    }, [path]);

    return usePromiseState(promiseRef.current, options);
};

export default useIpfsBlob;
