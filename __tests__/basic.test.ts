/**
 * Basic Sanity Test
 * Ensures Jest is configured correctly
 */

describe('Basic Test Suite', () => {
    test('math works correctly', () => {
        expect(1 + 1).toBe(2);
    });

    test('strings concatenate', () => {
        expect('Hello' + ' ' + 'World').toBe('Hello World');
    });

    test('arrays have correct length', () => {
        const arr = [1, 2, 3];
        expect(arr).toHaveLength(3);
    });

    test('objects have properties', () => {
        const obj = { name: 'NavEd', version: '1.0.0' };
        expect(obj).toHaveProperty('name');
        expect(obj.name).toBe('NavEd');
    });

    test('async operations work', async () => {
        const promise = Promise.resolve('success');
        const result = await promise;
        expect(result).toBe('success');
    });
});
