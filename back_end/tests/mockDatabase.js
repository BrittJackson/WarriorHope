const testUserDatabase = require('../public/js/userDB');
const testAssessmentDatabase = require('../public/js/assessmentDB');

jest.mock('../public/js/userDB', () => {return {
    getUser: jest.fn(),
    getUserID: jest.fn(),
    addUser: jest.fn(),
    getEmail: jest.fn(),
    setPwd: jest.fn(),
    setEmail: jest.fn(),
    emailInDB: jest.fn(),
}});

jest.mock('../public/js/assessmentDB', () => {return {
    /*
    * Enter mocked functions here
    */
}}, { virtual: true });

module.exports = {
    testUserDatabase: testUserDatabase,
    testAssessmentDatabase: testAssessmentDatabase,
};
