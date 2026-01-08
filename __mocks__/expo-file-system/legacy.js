// Mock for expo-file-system/legacy
// Provides mock implementations for file system operations

const documentDirectory = 'file:///mock/documents/';
const cacheDirectory = 'file:///mock/cache/';
const bundleDirectory = 'file:///mock/bundle/';

const getInfoAsync = jest.fn((uri) => Promise.resolve({
    exists: true,
    isDirectory: false,
    size: 1024,
    uri,
}));

const readAsStringAsync = jest.fn((uri, options = {}) => {
    // Return sample content for test files
    if (uri.includes('.txt')) {
        return Promise.resolve('This is the content of the text file.');
    }
    return Promise.resolve('Mock file content');
});

const writeAsStringAsync = jest.fn(() => Promise.resolve());
const deleteAsync = jest.fn(() => Promise.resolve());
const moveAsync = jest.fn(() => Promise.resolve());
const copyAsync = jest.fn(() => Promise.resolve());
const makeDirectoryAsync = jest.fn(() => Promise.resolve());
const readDirectoryAsync = jest.fn(() => Promise.resolve([]));
const downloadAsync = jest.fn(() => Promise.resolve({ uri: '', status: 200 }));

const createDownloadResumable = jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: '' })),
    pauseAsync: jest.fn(() => Promise.resolve()),
    resumeAsync: jest.fn(() => Promise.resolve({ uri: '' })),
    savable: jest.fn(() => ({})),
}));

const EncodingType = {
    UTF8: 'utf8',
    Base64: 'base64',
};

module.exports = {
    documentDirectory,
    cacheDirectory,
    bundleDirectory,
    getInfoAsync,
    readAsStringAsync,
    writeAsStringAsync,
    deleteAsync,
    moveAsync,
    copyAsync,
    makeDirectoryAsync,
    readDirectoryAsync,
    downloadAsync,
    createDownloadResumable,
    EncodingType,
};
