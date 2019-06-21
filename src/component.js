import { useMemo } from 'react';
import useIpfsBlob from './hook';

const IpfsBlob = ({ ipfs, path, children, ...options }) => {
    const promiseState = useIpfsBlob(ipfs, path, options);
    const renderedChildren = useMemo(() => children(promiseState), [children, promiseState]);

    return renderedChildren;
};

export default IpfsBlob;
