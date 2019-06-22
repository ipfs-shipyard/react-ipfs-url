import React from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import IpfsUrl from '../src/component';
import ipfs from './util/mock-ipfs';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    jest.clearAllMocks();

    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should return the correct status and value when fulfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsUrl input="/ipfs/png" ipfs={ ipfs }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should return the correct status and value when rejected', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const error = new Error('None of following providers were able to check for "/ipfs/error": ipfs, ipfsOffline');

    render(
        <IpfsUrl input="/ipfs/error" ipfs={ ipfs }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error, withinThreshold: false });
});

it('should pass options to the hook', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const error = new Error('None of following providers were able to check for "/ipfs/foo": ipfs, ipfsOffline');

    render(
        <IpfsUrl
            input="/ipfs/foo"
            ipfs={ ipfs }
            checkTimeout={ { ipfs: 10, ipfsOffline: 10 } }
            statusMap={ { pending: 'loading', rejected: 'error' } }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(30);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'error', value: error, withinThreshold: false });
});

it('should behave correctly if path changes', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsUrl input="/ipfs/png" ipfs={ ipfs }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsUrl input="/ipfs/gif" ipfs={ ipfs }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});
