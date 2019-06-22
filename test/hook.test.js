import React from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import useIpfsUrl, { cache } from '../src/hook';
import ipfs from './util/mock-ipfs';
import hideGlobalErrors from './util/hide-global-errors';

const IpfsUrl = ({ input, children, ...options }) => {
    const promiseState = useIpfsUrl(ipfs, input, options);

    return children(promiseState);
};

beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();

    // Hide "An update to null inside a test was not wrapped in act(...)" error
    // This won't be needed in react-dom@^16.9.0 because `act()` will support promises
    // See: https://github.com/facebook/react/issues/14769#issuecomment-479592338
    hideGlobalErrors();
});

it('should return the correct status and value when fulfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsUrl input="/ipfs/png">
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
    const error = new Error('None of following providers successfully checked "/ipfs/error": ipfs, ipfsOffline');

    render(
        <IpfsUrl input="/ipfs/error">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error, withinThreshold: false });

    const subErrors = childrenFn.mock.calls[1][0].value.errors;

    expect(subErrors).toBeTruthy();
    expect(subErrors.ipfsOffline).toEqual(new Error('error'));
});

it('should remain pending if it\'s taking too long', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsUrl input="/ipfs/foo">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
});

it('should timeout if it\'s taking too long', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const error = new Error('None of following providers successfully checked "/ipfs/foo": ipfs, ipfsOffline');

    render(
        <IpfsUrl input="/ipfs/foo" checkTimeout={ { ipfs: 10, ipfsOffline: 10 } }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(30);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error, withinThreshold: false });
});

it('should pass options to react-promiseful', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsUrl input="/ipfs/png" statusMap={ { pending: 'loading', fulfilled: 'success' } }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'success', value: 'blob:image/png', withinThreshold: false });
});

it('should behave correctly if input changes', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsUrl input="/ipfs/png">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsUrl input="/ipfs/gif">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(3);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});

it('should behave correctly if input changes (infligh)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsUrl input="/ipfs/png">
            { childrenFn }
        </IpfsUrl>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsUrl input="/ipfs/gif">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});

it('should behave correctly if input changes (infligh with error)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsUrl input="/ipfs/error">
            { childrenFn }
        </IpfsUrl>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsUrl input="/ipfs/png">
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should revoke object url on unmount', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { unmount } = render(
        <IpfsUrl input="/ipfs/png" disposeDelayMs={ 10 }>
            { childrenFn }
        </IpfsUrl>
    );

    await pDelay(10);

    unmount();

    await pDelay(20);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenNthCalledWith(1, 'blob:image/png');
});

it('should not revoke object url on unmount if more components are using the same file', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <>
            <IpfsUrl input="/ipfs/png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsUrl>
            <IpfsUrl input="/ipfs/png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsUrl>
        </>
    );

    await pDelay(10);

    rerender(
        <>
            <IpfsUrl input="/ipfs/png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsUrl>
        </>
    );

    await pDelay(20);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
});
