import ipfsOfflineProvider from '../src/providers/ipfs-offline';
import ipfs from './util/mock-ipfs';

describe('name', () => {
    it('should be ipfs', () => {
        expect(ipfsOfflineProvider.name).toBe('ipfsOffline');
    });
});

describe('parse', () => {
    it('should parse paths correctly', () => {
        expect(ipfsOfflineProvider.parse('/ipfs/xxx')).toBe('/ipfs/xxx');
        expect(ipfsOfflineProvider.parse('/ipns/yyy')).toBe('/ipns/yyy');
    });

    it('should assume words as ipfs paths', () => {
        expect(ipfsOfflineProvider.parse('xxx')).toBe('/ipfs/xxx');
    });

    it('should return undefined on anything else', () => {
        expect(ipfsOfflineProvider.parse('foo bar')).toBe(undefined);
    });
});

describe('check', () => {
    it('should call IPFS repo.blocks.get with the correct arguments', async () => {
        await ipfsOfflineProvider.check('/ipfs/png', '/ipfs/png', ipfs).catch(() => {});

        expect(ipfs._repo.blocks.get).toHaveBeenCalledTimes(1);
        expect(ipfs._repo.blocks.get.mock.calls[0][0].toString()).toBe('png');
    });

    it('should return true if repo block exists', async () => {
        await expect(ipfsOfflineProvider.check('https://ipfs.io/ipfs/png', '/ipfs/png', ipfs)).resolves.toBe(true);
    });

    it('should return false if repo block does not exist', async () => {
        await expect(ipfsOfflineProvider.check('https://ipfs.io/ipfs/foo', '/ipfs/foo', ipfs)).resolves.toBe(false);
    });

    it('should throw if an error occurred while checking repo block ', async () => {
        await expect(ipfsOfflineProvider.check('https://ipfs.io/ipfs/error', '/ipfs/error', ipfs)).rejects.toEqual(new Error('error'));
    });

    it('should return false for IPNS paths', async () => {
        await expect(ipfsOfflineProvider.check('https://ipfs.io/ipns/yyy', '/ipns/yyy', ipfs)).resolves.toBe(false);
    });
});

describe('createUrl', () => {
    it('should grab file contents and create an object url', async () => {
        await expect(ipfsOfflineProvider.createUrl('https://ipfs.io/ipfs/png', '/ipfs/png', ipfs)).resolves.toBe('blob:image/png');
    });
});
