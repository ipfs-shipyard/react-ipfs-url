import gatewayProvider from '../src/providers/gateway';

describe('name', () => {
    it('should be gateway', () => {
        expect(gatewayProvider.name).toBe('gateway');
    });
});

describe('parse', () => {
    it('should parse gateway URLs correctly', () => {
        expect(gatewayProvider.parse('http://ipfs.io/ipfs/xxx')).toBe('/ipfs/xxx');
        expect(gatewayProvider.parse('https://ipfs.io/ipfs/xxx')).toBe('/ipfs/xxx');
        expect(gatewayProvider.parse('https://ipfs.io/ipns/yyy')).toBe('/ipns/yyy');
        expect(gatewayProvider.parse('https://cloudflare-ipfs.com/ipfs/xxx')).toBe('/ipfs/xxx');
        expect(gatewayProvider.parse('https://cloudflare-ipfs.com/ipns/yyy')).toBe('/ipns/yyy');
    });

    it('should return undefined on invalid URLs', () => {
        expect(gatewayProvider.parse('https://foo.com')).toBe(undefined);
    });
});

describe('check', () => {
    it('should call fetch with the correct arguments', async () => {
        await gatewayProvider.check('https://ipfs.io/ipfs/xxx', '/ipfs/xxx').catch(() => {});

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe('https://ipfs.io/ipfs/xxx');
        expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'HEAD', mode: 'cors' });
    });

    it('should return true if request succeeded (200 ok)', async () => {
        await expect(gatewayProvider.check('https://ipfs.io/ipfs/xxx', '/ipfs/xxx')).resolves.toBe(true);
    });

    it('should return false if stat failed (not 200 ok)', async () => {
        fetch.mockImplementationOnce(async () => ({
            status: 404,
        }));

        await expect(gatewayProvider.check('https://ipfs.io/ipfs/xxx', '/ipfs/xxx')).resolves.toBe(false);
    });

    it('should return false if stat request failed', async () => {
        const error = new Error('foo');

        fetch.mockImplementationOnce(async () => { throw error; });

        await expect(gatewayProvider.check('https://ipfs.io/ipfs/xxx', '/ipfs/xxx')).rejects.toBe(error);
    });

    it('should return a cancelable promise', async () => {
        const promise = gatewayProvider.check('https://ipfs.io/ipfs/xxx', '/ipfs/xxx');

        expect(typeof promise.cancel).toBe('function');

        await promise.catch(() => {});
    });
});

describe('createUrl', () => {
    it('should return input', async () => {
        await expect(gatewayProvider.createUrl('https://ipfs.io/ipfs/xxx', '/ipfs/xxx')).resolves.toBe('https://ipfs.io/ipfs/xxx');
        await expect(gatewayProvider.createUrl('https://cloudflare-ipfs.com/ipfs/xxx', '/ipfs/xxx')).resolves.toBe('https://cloudflare-ipfs.com/ipfs/xxx');
    });
});
