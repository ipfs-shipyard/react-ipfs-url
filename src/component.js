import { useMemo } from 'react';
import PropTypes from 'prop-types';
import useIpfsUrl from './hook';

const IpfsUrl = ({ ipfs, input, children, ...options }) => {
    const promiseState = useIpfsUrl(ipfs, input, options);
    const renderedChildren = useMemo(() => children(promiseState), [children, promiseState]);

    return renderedChildren;
};

IpfsUrl.propTypes = {
    ipfs: PropTypes.object.isRequired,
    input: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
};

export default IpfsUrl;
