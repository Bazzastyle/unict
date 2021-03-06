const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');
const Tweet = require('../../models/tweet');
const {expectJson, createTweet} = require('./utils/index');
const expectedNotFoundError = {message: 'Tweet not found'};

chai.use(chaiHttp);

describe('tweet, GET: /tweets', () => {
  it('should return empty array if not tweets are found', async() => {
    const result = await chai.request(app).get('/tweets');

    expectJson(result);
    expect(result.status).to.be.equal(200);
    expect(result.body).to.be.instanceof(Array);
    expect(result.body).to.has.lengthOf(0);
  })
  
  describe('tweets inside database', () => {
    let createdTweet = undefined;

    before('create user and tweet', async () => {
      createdTweet = await createTweet();
    });

    after('delete tweet', () => {
      createdTweet
      ? createdTweet.remove()
      : console.log('missing tweet');
    });

    it('tweets found if present in database', async () => {
      const result = await chai.request(app).get('/tweets');

      expectJson(result);
      expect(result.status).to.be.equal(200);
      expect(result.body).to.be.instanceof(Array);
      expect(result.body).to.be.lengthOf(1);
    })
  });
});

describe('tweet, POST: /tweets', () => {
  let createdTweet = undefined;

  after('delete tweet', () => {
    createdTweet
    ? createdTweet.remove()
    : console.log('missing tweet');
  });

  it('save new tweet inside database', async () => {
    createdTweet = await createTweet();
    const result = await chai.request(app).post('/tweets').send(createdTweet);
    
    expectJson(result);
    expect(result.status).to.be.equal(401);

    expect(createdTweet).to.be.not.undefined;
    expect(result).to.have.property('body');
    expect(createdTweet).to.has.property('tweet', 'Ciao a tutti');
  });
});

describe('GET: /tweets/:id', () => {
    it('Returns status 404 if tweet is missing', async () => {
      const newObjectId = mongoose.Types.ObjectId();
      const result = await chai.request(app)
          .get(`/tweets/${newObjectId}`);
      expectJson(result);
      expect(result.status).to.be.equal(404);
      expect(result).to.have.property('body');
      expect(result.body).to.be.deep.equals(expectedNotFoundError);
    });

    describe('Tweets inside database', () => {
        let createdTweet = undefined;
        before('Create tweet', async () => {
          createdTweet = await createTweet();
        });
        after('Delete tweet', () => {
        createdTweet ? createdTweet.remove() : console.log('missing tweet');
        });
        it('Return expected tweet from database', async () => {
          const result = await chai.request(app)
            .get(`/tweet/${createdTweet._id}`);
          expectJson(result);
          expect(result.status).to.be.equal(404);
        });
    });
});


