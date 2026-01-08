// Mock for expo-document-picker
// This mock returns a success result by default for tests that need file selection
// Tests can override this behavior using jest.fn().mockResolvedValueOnce()

const getDocumentAsync = jest.fn().mockImplementation((options = {}) => {
    // Default: return a successful document pick result
    return Promise.resolve({
        canceled: false,
        assets: [
            {
                name: 'test-document.txt',
                uri: 'file:///mock/documents/test-document.txt',
                size: 1024,
                mimeType: 'text/plain',
            },
        ],
    });
});

module.exports = {
    getDocumentAsync,
    DocumentPickerAsset: {},
    DocumentPickerOptions: {},
};
