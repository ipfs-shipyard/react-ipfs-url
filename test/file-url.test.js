import { createFileUrl } from '../src/file-url';
import ipfs from './util/mock-ipfs';

const options = {
    strategy: 'input-first',
    checkTimeout: {
        gateway: 12500,
        infura: 12500,
        ipfsOffline: 5000,
        ipfs: 180000,
    },
    disposeDelayMs: 60000,
};

describe('createFileUrl', () => {
    it('should return as is if not a valid ipfs path, ipfs path or provider URL', async () => {
        await expect(createFileUrl(ipfs, 'http://foo.com', options)).resolves.toBe('http://foo.com');
    });
});

describe('isFileUrlDisposable', () => {

});

describe('disposeFileUrl', () => {

});
