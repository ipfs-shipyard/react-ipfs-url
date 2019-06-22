import infuraProvider from '../src/providers/infura';

describe('name', () => {
    it('should be infura', () => {
        expect(infuraProvider.name).toBe('infura');
    });
});

describe('parse', () => {
    it('should parse a infura URLs correctly', () => {
        expect(infuraProvider.parse('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx')).toBe('/ipfs/xxx');
        expect(infuraProvider.parse('https://ipfs.infura.io:5001/api/v0/get?arg=xxx')).toBe('/ipfs/xxx');
        expect(infuraProvider.parse('https://ipfs.infura.io:5001/api/v0/block/stat?arg=xxx')).toBe('/ipfs/xxx');
    });

    it('should return undefined on invalid URLs', () => {
        expect(infuraProvider.parse('https://foo.com/api/v0/cat?arg=xxx')).toBe(undefined);
    });
});

describe('check', () => {
    it('should call fetch with the correct arguments', async () => {
        await infuraProvider.check('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx', '/ipfs/xxx').catch(() => {});

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe('https://ipfs.infura.io:5001/api/v0/block/stat?arg=xxx');
        expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'GET', mode: 'cors' });
    });

    it('should return true if stat succeeded (200 ok)', async () => {
        await expect(infuraProvider.check('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx', '/ipfs/xxx')).resolves.toBe(true);
    });

    it('should return false if stat failed (not 200 ok)', async () => {
        fetch.mockImplementationOnce(async () => ({
            status: 404,
        }));

        await expect(infuraProvider.check('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx', '/ipfs/xxx')).resolves.toBe(false);
    });

    it('should return false if stat request failed', async () => {
        fetch.mockImplementationOnce(async () => { throw new Error('foo'); });

        await expect(infuraProvider.check('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx', '/ipfs/xxx')).resolves.toBe(false);
    });

    it('should return a cancelable promise', async () => {
        const promise = infuraProvider.check('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx', '/ipfs/xxx');

        expect(typeof promise.cancel).toBe('function');

        await promise.catch(() => {});
    });
});

describe('createUrl', () => {
    it('should create a cat URL', async () => {
        await expect(infuraProvider.createUrl('https://ipfs.infura.io:5001/api/v0/block/stat?arg=xxx', '/ipfs/xxx')).resolves.toBe('https://ipfs.infura.io:5001/api/v0/cat?arg=xxx');
    });
});
