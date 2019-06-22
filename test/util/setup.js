global.URL.createObjectURL = jest.fn((blob) => `blob:${blob.type}`);
global.URL.revokeObjectURL = jest.fn();

global.fetch = jest.fn(async () => ({
    status: 200,
}));
