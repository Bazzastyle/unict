const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');

const Tweet = require('../../../models/tweet');

module.exports.expectJson = function (request) {
    expect(request.header).to.has.property('content-type');
    expect(request.header['content-type']).contains('application/json');
};

module.exports.createTweet = async function () {
    const newObjectId = mongoose.Types.ObjectId();
    const newTweet = {
        _author: newObjectId,
        tweet: 'Ciao a tutti',
        created_at: Date.now()
    };
    return await Tweet.create(newTweet);
};