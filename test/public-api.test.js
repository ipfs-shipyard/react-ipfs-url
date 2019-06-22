import { IpfsUrl, useIpfsUrl } from '../src';

it('should export <IpfsUrl>', () => {
    expect(typeof IpfsUrl).toBe('function');
});

it('should export <useIpfsUrl>', () => {
    expect(typeof useIpfsUrl).toBe('function');
});
