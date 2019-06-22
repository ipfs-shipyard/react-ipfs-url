const paths = {
    '/ipfs/png': Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'),
    '/ipfs/gif': Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64'),
};

const ipfs = {
    _repo: {
        blocks: {
            get: jest.fn((cid, callback) => {
                const path = `/ipfs/${cid.toString()}`;

                if (paths[path]) {
                    return callback(null, paths[path]);
                }

                if (path === '/ipfs/error') {
                    return callback(new Error('error'));
                }

                return callback(Object.assign(new Error('Not found'), { code: 'ERR_NOT_FOUND' }));
            }),
        },
    },

    block: {
        stat: jest.fn(async (key) => {
            const path = `/ipfs/${key}`;

            if (paths[path]) {
                return [
                    {
                        key,
                        size: paths[path].length,
                    },
                ];
            }

            if (path === '/ipfs/error') {
                throw new Error('error');
            }

            return new Promise(() => {});
        }),
    },

    get: jest.fn(async (path) => {
        if (paths[path]) {
            return [
                {
                    path,
                    content: paths[path],
                },
            ];
        }

        if (path === '/ipfs/error') {
            throw new Error('error');
        }

        return new Promise(() => {});
    }),
};

export default ipfs;
