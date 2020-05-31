const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');
const User = require('../../models/user');
const expectedNotFoundError = { message: 'User non found' };
const { expectJson, createUser } = require('./utils/index');
chai.use(chaiHttp);

//Test: Describe to test array of users is empty
describe('get / ', () => {
    it('User get:/users If array of users is empty return 200', async () => {
        const result = await chai.request(app).get('/users');
        expect(result.status).to.be.equal(200);
        expect(result.body).to.be.instanceOf(Array);
        expect(result.body).to.has.lengthOf(0);
    });

    //Test adding a user and check if the lenght of array is 1 and then
    //delete in the after the user created to clean the test
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

//Test to delete a user that doesn't exist
describe('delete /users/:id', () => {
    it('should return 404 status if user don\'t exists', async () => {
        const newObjectId = mongoose.Types.ObjectId();
        const result = await chai.request(app)
            .delete(`/users/${newObjectId}`);
        expect(result).to.have.property('status', 404);
        expect(result).to.have.property('body');
        expect(result.body).to.be.deep.equals(expectedNotFoundError);
    });
    //Test to delete a user that exist and than delete the user to clean the test
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

//API TEST users.js --> GET by ID
//TEST 404 if user is missing &&  return expected user from DB

describe('GET: /users/:id', () => {
    it('Returns status 404 if user is missing', async () => {
      const newObjectId = mongoose.Types.ObjectId();
      const result = await chai.request(app)
        .get(`/users/${newObjectId}`);
      expectJson(result);
      expect(result.status).to.be.equal(404);
      expect(result).to.have.property('body');
      expect(result.body).to.be.deep.equals(expectedNotFoundError);
    });
  
    describe('Users inside database', () => {
      let createdUser = undefined;
      before('Create user', async () => {
        createdUser = await createUser();
      });
      after('Delete user', () => {
        createdUser ? createdUser.remove() : console.log('missing user');
      });
      it('Return expected user from database', async () => {
        const result = await chai.request(app)
            .get(`/users/${createdUser._id.toString()}`);
        expectJson(result);
        expect(result.status).to.be.equal(200);
        expect(result.body).to.has.property('_id', createdUser._id.toString());
      });
    });
  });

  //API TEST users.js --> POST
  //TEST save new user inside database and return it && return a status 400 if email is not in a valid format
  
  describe('POST: /users', () => {
    let createdUserId = undefined;

    after('Delete user', async () => {
      createdUserId 
      ? await User.findByIdAndDelete(createdUserId) 
      : console.log('Missing document');
    });

    it('Save new user inside database and return it', async () =>{
    
      const newUser = {
        name: 'Pippo',
        surname: 'Franco',
        email: 'pippofranco@gmail.it',
        password: 'Paperino'
        
      };
      const result = await chai.request(app).post('/users').send(newUser);
      expectJson(result);
      expect(result).to.has.property('status', 201);
      expect(result.body).to.has.property('_id');
      
      createdUserId = result.body._id;
      const createdUser = await User.findById(createdUserId);
      expect(createdUser).to.be.not.undefined;
      expect(createdUser).to.has.property('name', 'Pippo');
      expect(createdUser).to.has.property('surname', 'Franco');
      expect(createdUser).to.has.property('email', 'pippofranco@gmail.it');
    });

    it('Return a validation error 400 if email filed is not an email', async ()=> {
      const newUser = {
        name: 'Bojack',
        surname: 'Horseman',
        email: 'mastrodongesualdo',
        password: 'Paperino'
      };
      const result = await chai.request(app).post('/users').send(newUser);
      expectJson(result);
      expect(result).to.has.property('status', 400);
      
    });

  });
