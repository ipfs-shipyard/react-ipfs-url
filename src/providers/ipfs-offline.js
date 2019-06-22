import pify from 'pify';
import ipfsProvider from './ipfs';

export default {
    ...ipfsProvider,

    name: 'ipfsOffline',

    async check(input, ipfsPath, ipfs) {
        const [, type, hash] = ipfsPath.split('/');

        if (type !== 'ipfs') {
            return false;
        }

        let block;

        try {
            block = await pify(ipfs._repo.blocks.get)(hash);
        } catch (err) {
            if (err.code === 'ERR_NOT_FOUND') {
                return false;
            }

            throw err;
        }

        return !!block;
    },
};
