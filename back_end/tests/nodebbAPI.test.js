const api = require('../nodebbAPI');
let min = 1000;
let max = 5000;
let id;

// Since there is no test nodeBB random can be used to avoid conflicting tests.
beforeAll (async () => {
    min = Math.ceil(min);
    max = Math.floor(max);
    num = Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    id = `Test${num}`;
    console.log(id)
});

describe ('Testing the node api', () => {
    afterAll (async () => {
        try {
            await api.removeGroup(id);
            await api.removeCategory(id);
        } catch (err) {
            console.log(`After catch ${err}`);
        }
    });

    describe ('Testing the group node api', () => {
    
        it('test add a group', async () => {
            return api.makeGroup(id).then(result => expect(result).toBe(200))
        });
        it('test add a group that exists', async () => {
            return api.makeGroup(id).then(result => expect(result).toBe(400))
        });
        it('test delete a group', async () => {
            return api.removeGroup(id).then(result => expect(result).toBe(200))
        });
        it('test delete a group that does not exist', async () => {
            return api.removeGroup(id).then(result => expect(result).toBe(404))
        });
    });

    describe ('Testing the category node api', () => {
        beforeAll (async (/*done*/) => {
            try {
                await api.makeGroup(id);
            } catch (err) {
                console.log(`Before catch ${err}`);
            }
        });
        afterAll (async () => {
            try {
                await api.removeGroup(id);
            } catch (err) {
                console.log(`After catch ${err}`);
            }
        });
        it('test add a category', async () => {
            return api.makeCategory(id).then(result => expect(result).toBe(200))
        });
        it('test add a category that exists', async () => {
            return api.makeCategory(id).then(result => expect(result).toBe(400))
        });
        it('test update a category', async () => {
            return api.updateCategory(id).then(result => expect(result).toBe(200))
        });
        it('test delete a category', async () => {
            return api.removeCategory(id).then(result => expect(result).toBe(200))
        });
        it('test delete a category that does not exist', async () => {
            return api.removeCategory(id).then(result => expect(result).toBe(404))
        });
    });

    it('test add a group and category', async () => {
        return api.setup(id).then(result => expect(result).toBe(200))
    });
});
