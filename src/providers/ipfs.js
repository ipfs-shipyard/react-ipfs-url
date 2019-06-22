import fileType from 'file-type';

const HASH_REGEXP = /^\w+$/;
const PATH_REGEXP = /^\/(ip(?:f|n)s)\/(?:(\w+)\b)/;

export default {
    name: 'ipfs',

    parse(input) {
        if (HASH_REGEXP.test(input)) {
            return `/ipfs/${input}`;
        }

        const match = input.match(PATH_REGEXP);

        if (!match) {
            return;
        }

        return `/${match[1]}/${match[2]}`;
    },

    async check(input, ipfsPath, ipfs) {
        const [, type, hash] = ipfsPath.split('/');

        if (type !== 'ipfs') {
            return false;
        }

        let stat;

        try {
            stat = await ipfs.block.stat(hash);
        } catch (err) {
            return false;
        }

        return !!stat;
    },

    async createUrl(input, ipfsPath, ipfs) {
        const files = await ipfs.get(ipfsPath);
        const buffer = files[0].content;

        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const { mime } = fileType(arrayBuffer);

        const blob = new Blob([arrayBuffer], { type: mime });

        return URL.createObjectURL(blob);
    },

    async disposeUrl(url) {
        URL.revokeObjectURL(url);
    },
};
