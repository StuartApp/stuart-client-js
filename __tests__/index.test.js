const {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
} = require('./../lib/index');

const nock = require('nock');

describe('#getAccessToken', () => {

  describe('when no access token exists', () => {

    test('returns a new access token', () => {

      authenticator = new Authenticator(Environment.SANDBOX(), "c6058849d0a056fc743203acb8e6a850dad103485c3edc51b16a9260cc7a7688", "aa6a415fce31967501662c1960fcbfbf4745acff99acb19dbc1aae6f76c9c619");

      nock(authenticator.environment.baseUrl)
        .post('/oauth/token')
        .reply(200, {
          access_token: "new-token",
          token_type: "bearer",
          expires_in: 2592000,
          scope: "api",
          created_at: 1519753273
        });

      authenticator.getAccessToken().then(accessToken => expect(accessToken).toEqual("new-token"));
    })
  })
})
