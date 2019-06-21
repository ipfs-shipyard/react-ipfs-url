import React from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import IpfsFileUrl from '../src/component';
import ipfs from './util/mock-ipfs';
import hideGlobalErrors from './util/hide-global-errors';

beforeEach(() => {
    jest.clearAllMocks();

    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should return the correct status and value when fullfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsFileUrl path="png" ipfs={ ipfs }>
            { childrenFn }
        </IpfsFileUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should return the correct status and value when rejected', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsFileUrl path="error" ipfs={ ipfs }>
            { childrenFn }
        </IpfsFileUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: new Error('error'), withinThreshold: false });
});

it('should pass options to the hook', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const error = new Error('Promise timed out after 10 milliseconds');

    render(
        <IpfsFileUrl
            path="foo"
            ipfs={ ipfs }
            timeout={ 10 }
            statusMap={ { pending: 'loading', rejected: 'error' } }>
            { childrenFn }
        </IpfsFileUrl>
    );

    await pDelay(20);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'error', value: error, withinThreshold: false });
});

it('should behave correctly if path changes', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsFileUrl path="png" ipfs={ ipfs }>
            { childrenFn }
        </IpfsFileUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsFileUrl path="gif" ipfs={ ipfs }>
            { childrenFn }
        </IpfsFileUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});
