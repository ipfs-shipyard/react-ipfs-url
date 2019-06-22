import pTimeout from 'p-timeout';
import pLocate from 'p-locate';
import { size } from 'lodash';
import * as providers from './providers';

const providersArray = Object.values(providers);

const parseInput = (input) => {
    let ipfsPath;

    const originProvider = providersArray.find((provider_) => {
        ipfsPath = provider_.parse(input);

        return !!ipfsPath;
    });

    if (!originProvider) {
        return;
    }

    return { ipfsPath, originProvider };
};

export const createFileUrl = async (ipfs, input, options) => {
    const parsed = parseInput(input);

    if (!parsed) {
        return input;
    }

    const { ipfsPath, originProvider } = parsed;

    let order;

    switch (options.strategy) {
    case 'ipfs-first':
        order = new Set([providers.ipfsOffline, providers.ipfs, originProvider]);
        break;
    case 'ipfs-offline-first':
        order = new Set([providers.ipfsOffline, originProvider, providers.ipfs]);
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

    const errors = {};

    const provider = await pLocate(order, (provider) => {
        const promise = provider.check(input, ipfsPath, ipfs)
        .catch((err) => {
            errors[provider.name] = err;
        });

        return pTimeout(
            promise,
            options.checkTimeout[provider.name],
            () => null,
        );
    });

    if (size(errors)) {
        console.warn(`Some errors ocurred while checking for "${ipfsPath}"`, errors);
    }

    if (!provider) {
        const names = Array.from(order)
        .map((provider) => provider.name)
        .join(', ');

        throw Object.assign(
            new Error(`None of following providers successfully checked "${ipfsPath}": ${names}`),
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
