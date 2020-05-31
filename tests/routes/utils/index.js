const chai = require('chai');
const expect = chai.expect;

const User = require('../../../models/user');

module.exports.expectJson = function (request) {
    expect(request.header).to.has.property('content-type');
    expect(request.header['content-type']).contains('application/json');
};

module.exports.createUser = async function () {
    const newUser = {
        name: 'Steve',
        surname: 'Jobs',
        email: 'stevejobs@gmail.com',
        password: "Pippo"
    };
    return await User.create(newUser);
};