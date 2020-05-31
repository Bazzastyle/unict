const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');
const User = require('../../models/user');
const expectedNotFoundError = { message: 'User non found' };
const { expectJson, createUser } = require('./utils/index');


chai.use(chaiHttp);


describe('get / ', () => {
    it('User get:/users If array of users is empty return 200', async () => {
        const result = await chai.request(app).get('/users');
        expect(result.status).to.be.equal(200);
        expect(result.body).to.be.instanceOf(Array);
        expect(result.body).to.has.lengthOf(0);
    });
    describe('Create user', () => {
        let createdUser = undefined;
        before('create user by createUser()', async () => {
            createdUser = await createUser();
        });
        after('delete user', () => {
            createdUser ? createdUser.remove() : console.log('missing user');
        });
        it('Check if array is 1 after created a user', async () => {
            const result = await chai.request(app).get('/users');
            expectJson(result);
            expect(result.status).to.be.equal(200);
            expect(result.body).to.be.instanceOf(Array);
            expect(result.body).to.be.lengthOf(1);
        });
    });
});

describe('delete /users/:id', () => {
    it('should return 404 status if user don\'t exists', async () => {
        const newObjectId = mongoose.Types.ObjectId();
        const result = await chai.request(app)
            .delete(`/users/${newObjectId}`);
        expect(result).to.have.property('status', 404);
        expect(result).to.have.property('body');
        expect(result.body).to.be.deep.equals(expectedNotFoundError);
    });
    describe('With an existing user', () => {
        let createdUser = undefined;
        before('create user', async () => {
            createdUser = await createUser();
        });
        after('delete user', () => {
            createdUser ? createdUser.remove() : console.log('missing user');
        });
        it('Delete existing user', async () => {
            const result = await chai.request(app)
                .delete(`/users/${createdUser._id}`);
            expect(result).to.have.property('status', 200);
            expect(result).to.have.property('body');
            expect(result.body).to.be.deep.equals({ message: 'User successfully deleted' })
        });
    })

});
