import React from 'react';
import { render } from '@testing-library/react';
import pDelay from 'delay';
import useIpfsBlob, { cache } from '../src/hook';
import ipfs from './util/mock-ipfs';
import hideGlobalErrors from './util/hide-global-errors';

const IpfsBlob = ({ path, children, ...options }) => {
    const promiseState = useIpfsBlob(ipfs, path, options);

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

it('should return the correct status and value when fullfilled', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsBlob path="png">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should return the correct status and value when rejected', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsBlob path="error">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: new Error('error'), withinThreshold: false });
});

it('should remaining pending if it\'s taking too long (timeout = 0)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsBlob path="foo" timeout={ 0 }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
});

it('should remaining pending if it\'s taking too long (timeout = Infinity)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsBlob path="foo" timeout={ Infinity }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
});

it('should timeout if it\'s taking too long', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);
    const error = new Error('Promise timed out after 10 milliseconds');

    render(
        <IpfsBlob path="foo" timeout={ 10 }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(20);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'rejected', value: error, withinThreshold: false });
});

it('should pass options to react-promiseful', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    render(
        <IpfsBlob path="png" statusMap={ { pending: 'loading', fulfilled: 'success' } }>
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'loading', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'success', value: 'blob:image/png', withinThreshold: false });
});

it('should behave correctly if path changes', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsBlob path="png">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsBlob path="gif">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(3);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(3, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});

it('should behave correctly if path changes (infligh)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsBlob path="png">
            { childrenFn }
        </IpfsBlob>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsBlob path="gif">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/gif', withinThreshold: false });
});

it('should behave correctly if path changes (infligh with error)', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { rerender } = render(
        <IpfsBlob path="error">
            { childrenFn }
        </IpfsBlob>
    );

    expect(childrenFn).toHaveBeenCalledTimes(1);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    childrenFn.mockClear();

    rerender(
        <IpfsBlob path="png">
            { childrenFn }
        </IpfsBlob>
    );

    await pDelay(10);

    expect(childrenFn).toHaveBeenCalledTimes(2);
    expect(childrenFn).toHaveBeenNthCalledWith(1, { status: 'pending', value: undefined, withinThreshold: false });
    expect(childrenFn).toHaveBeenNthCalledWith(2, { status: 'fulfilled', value: 'blob:image/png', withinThreshold: false });
});

it('should revoke object url on unmount', async () => {
    const childrenFn = jest.fn(() => <div>foo</div>);

    const { unmount } = render(
        <IpfsBlob path="png" disposeDelayMs={ 10 }>
            { childrenFn }
        </IpfsBlob>
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
            <IpfsBlob path="png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsBlob>
            <IpfsBlob path="png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsBlob>
        </>
    );

    await pDelay(10);

    rerender(
        <>
            <IpfsBlob path="png" disposeDelayMs={ 10 }>
                { childrenFn }
            </IpfsBlob>
        </>
    );

    await pDelay(20);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
});
