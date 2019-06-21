const paths = {
    png: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'),
    gif: Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64'),
};

const ipfs = {
    get: async (path) => {
        if (paths[path]) {
            return [
                {
                    path,
                    content: paths[path],
                },
            ];
        }

        if (path === 'error') {
            throw new Error('error');
        }

        return new Promise(() => {});
    },
};

export default ipfs;
