import ipfsProvider from '../src/providers/ipfs';
import ipfs from './util/mock-ipfs';

describe('name', () => {
    it('should be ipfs', () => {
        expect(ipfsProvider.name).toBe('ipfs');
    });
});

describe('parse', () => {
    it('should parse paths correctly', () => {
        expect(ipfsProvider.parse('/ipfs/xxx')).toBe('/ipfs/xxx');
        expect(ipfsProvider.parse('/ipns/yyy')).toBe('/ipns/yyy');
    });

    it('should assume words as ipfs paths', () => {
        expect(ipfsProvider.parse('xxx')).toBe('/ipfs/xxx');
    });

    it('should return undefined on anything else', () => {
        expect(ipfsProvider.parse('foo bar')).toBe(undefined);
    });
});

describe('check', () => {
    it('should call IPFS block.stat with the correct arguments', async () => {
        await ipfsProvider.check('/ipfs/png', '/ipfs/png', ipfs).catch(() => {});

        expect(ipfs.block.stat).toHaveBeenCalledTimes(1);
        expect(ipfs.block.stat.mock.calls[0][0]).toBe('png');
    });

    it('should return true if block stat succeeds', async () => {
        await expect(ipfsProvider.check('https://ipfs.io/ipfs/png', '/ipfs/png', ipfs)).resolves.toBe(true);
    });

    it('should return false if block stat fails', async () => {
        await expect(ipfsProvider.check('https://ipfs.io/ipfs/error', '/ipfs/error', ipfs)).resolves.toBe(false);
    });

    it('should return false for IPNS paths', async () => {
        await expect(ipfsProvider.check('https://ipfs.io/ipns/yyy', '/ipns/yyy', ipfs)).resolves.toBe(false);
    });
});

describe('createUrl', () => {
    it('should grab file contents and create an object url', async () => {
        await expect(ipfsProvider.createUrl('https://ipfs.io/ipfs/png', '/ipfs/png', ipfs)).resolves.toBe('blob:image/png');
    });
});
