import pTimeout from 'p-timeout';
import pLocate from 'p-locate';
import * as providers from './providers';

const providersArray = Object.values(providers);

const parseInput = (input) => {
    let ipfsPath;

    const originProvider = providersArray.find((provider_) => {
        ipfsPath = provider_.parse(input);

        return !!ipfsPath;
    });

    return { ipfsPath, originProvider };
};

export const createFileUrl = async (ipfs, input, options) => {
    const { ipfsPath, originProvider } = parseInput(input);

    let order;

    switch (options.strategy) {
    case 'ipfs-first':
        order = new Set([providers.ipfsOffline, providers.ipfs, originProvider]);
        break;
    case 'ipfs-only':
        order = new Set([providers.ipfsOffline, providers.ipfs]);
        break;
    case 'ipfs-offline-only':
        order = new Set([providers.ipfsOffline]);
        break;
    case 'input-first':
    default:
        order = new Set([originProvider, providers.ipfsOffline, providers.ipfs]);
    }

    const errors = [];

    const provider = await pLocate(order, async (provider) => (
        pTimeout(
            provider.check(input, ipfsPath, ipfs).catch((err) => errors.push(err)),
            options.checkTimeout[provider.name],
            () => null,
        )
    ));

    if (!provider) {
        const names = Array.from(order)
        .map((provider) => provider.name)
        .join(', ');

        throw Object.assign(
            new Error(`None of following providers were able to check for "${ipfsPath}": ${names}`),
            { errors }
        );
    }

    const url = await provider.createUrl(input, ipfsPath, ipfs);

    return {
        provider: provider.name,
        value: url,
    };
};

export const isFileUrlDisposable = (fileUrl) => {
    const provider = providers[fileUrl.provider];

    return !!provider.disposeUrl;
};

export const disposeFileUrl = (fileUrl) => {
    const provider = providers[fileUrl.provider];

    return provider.disposeUrl && provider.disposeUrl(fileUrl.value);
};
