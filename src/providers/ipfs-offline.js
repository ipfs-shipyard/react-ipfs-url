import pify from 'pify';
import CID from 'cids';
import ipfsProvider from './ipfs';

export default {
    ...ipfsProvider,

    name: 'ipfsOffline',

    async check(input, ipfsPath, ipfs) {
        const [, type, hash] = ipfsPath.split('/');

        if (type !== 'ipfs') {
            return false;
        }

        if (!ipfs._repo) {
            return false;
        }

        let block;

        try {
            const cid = new CID(hash);

            block = await pify(ipfs._repo.blocks.get)(cid);
        } catch (err) {
            if (err.code === 'ERR_NOT_FOUND') {
                return false;
            }

            throw err;
        }

        return !!block;
    },
};
