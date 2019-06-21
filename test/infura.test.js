import React from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import IpfsBlob from '../src/component';
import ipfs from './util/mock-ipfs';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    jest.clearAllMocks();

    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should render with the infura URL if it exists (cat)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const url = 'https://ipfs.infura.io:5001/api/v0/cat?arg=xxx';

    render(
        <IpfsBlob path={ url } ipfs={ ipfs }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: url, withinThreshold: false });
});

it('should render with the infura URL if it exists (get)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const url = 'https://ipfs.infura.io:5001/api/v0/get?arg=xxx';
    const catUrl = 'https://ipfs.infura.io:5001/api/v0/cat?arg=xxx';

    render(
        <IpfsBlob path={ url } ipfs={ ipfs }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: catUrl, withinThreshold: false });
});

it('should fallback to IPFS if the infura URL if it exists', async () => {
    fetch.mockImplementationOnce(async () => ({ status: 404 }));

    const childrenFn = jest.fn(() => <div>foo</div>);
    const url = 'https://ipfs.infura.io:5001/api/v0/cat?arg=png';

    render(
        <IpfsBlob path={ url } ipfs={ ipfs }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should not revoke url object on unmount as they are not blobs', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const url = 'https://ipfs.infura.io:5001/api/v0/get?arg=xxx';

    const { unmount } = render(
        <IpfsBlob path={ url } ipfs={ ipfs } disposeDelayMs={ 10 }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    unmount();

    await pDelay(20);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
});
