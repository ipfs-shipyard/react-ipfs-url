import fileType from 'file-type';
import pTimeout from 'p-timeout';
import * as infura from './infura';

const maybeWrapInTimeout = (promise, timeout) =>
    timeout > 0 && timeout !== Infinity ? pTimeout(promise, timeout) : promise;

const getIpfsPathAsBlob = async (ipfs, path) => {
    const files = await ipfs.get(path);
    const buffer = files[0].content;

    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const { mime } = fileType(arrayBuffer);

    return new Blob([arrayBuffer], { type: mime });
};

export const getFileUrl = async (ipfs, path, options) => {
    const infuraHash = infura.getHashFromUrl(path);

    if (infuraHash) {
        const catUrl = infura.getCatUrl(infuraHash);
        const exists = await maybeWrapInTimeout(infura.fileExists(catUrl), options.infuraTimeout);

        if (exists) {
            return { type: 'url', value: catUrl };
        }

        path = infuraHash;
    }

    const blob = await maybeWrapInTimeout(getIpfsPathAsBlob(ipfs, path), options.timeout);

    return { type: 'object-url', value: URL.createObjectURL(blob) };
};

export const isFileUrlDisposable = (fileUrl) => fileUrl.type === 'object-url';

export const disposeFileUrl = (fileUrl) => {
    if (fileUrl.type === 'object-url') {
        URL.revokeObjectURL(fileUrl.value);
    }
};
