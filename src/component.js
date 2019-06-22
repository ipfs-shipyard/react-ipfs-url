import { useMemo } from 'react';
import useIpfsUrl from './hook';

const IpfsUrl = ({ ipfs, input, children, ...options }) => {
    const promiseState = useIpfsUrl(ipfs, input, options);
    const renderedChildren = useMemo(() => children(promiseState), [children, promiseState]);

    return renderedChildren;
};

export default IpfsUrl;
