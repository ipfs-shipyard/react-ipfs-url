import { IpfsFileUrl, useIpfsFileUrl } from '../src';

it('should export <IpfsFileUrl>', () => {
    expect(typeof IpfsFileUrl).toBe('function');
});

it('should export <useIpfsFileUrl>', () => {
    expect(typeof useIpfsFileUrl).toBe('function');
});
