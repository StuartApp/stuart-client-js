/**
  * @jest-environment node
*/

const {
  Authenticator,
  Environment,
  HttpClient
} = require('./../index')

const Request = require('request')
const PackageJson = require('../package.json')

const nock = require('nock')

describe('index', () => {
  beforeEach(() => {
    authenticator = new Authenticator(Environment.SANDBOX(), 'c6058849d0a056fc743203acb8e6a850dad103485c3edc51b16a9260cc7a7688', 'aa6a415fce31967501662c1960fcbfbf4745acff99acb19dbc1aae6f76c9c619')

    nock(authenticator.environment.baseUrl)
      .post('/oauth/token')
      .reply(200, {
        access_token: 'new-token',
        token_type: 'bearer',
        expires_in: 2592000,
        scope: 'api',
        created_at: 1519753273
      })
  })

  describe('Authenticator#getAccessToken', () => {
    describe('when no access token exists', () => {
      test('returns a new access token', () => {
        return authenticator.getAccessToken().then(
          (accessToken) => expect(accessToken).toEqual('new-token')
        )
      })
    })

    describe('when a valid access token already exists', () => {
      beforeEach(() => {
        authenticator.accessToken = authenticator.oauthClient.createToken('current-valid-token', null, 'client_credentials', {})
      })

      it('returns the current valid access token', () => {
        return authenticator.getAccessToken().then(
          (accessToken) => expect(accessToken).toEqual('current-valid-token')
        )
      })
    })

    describe('when an expired access token already exists', () => {
      beforeEach(() => {
        authenticator.accessToken = authenticator.oauthClient.createToken('current-valid-token', null, 'client_credentials', {})
        authenticator.accessToken.expired = jest.fn(() => {
          return true
        })
      })

      it('returns the current valid access token', () => {
        return authenticator.getAccessToken().then(
          (accessToken) => expect(accessToken).toEqual('new-token')
        )
      })
    })
  })

  describe('HttpClient#performGet', () => {
    beforeEach(() => {
      httpClient = new HttpClient(authenticator)

      nock(httpClient.authenticator.environment.baseUrl)
        .get('/some-url')
        .reply(200, {
          some: 'response'
        })

      nock(httpClient.authenticator.environment.baseUrl)
        .get('/some-url?param1=one&param2=two')
        .reply(200, {
          some: 'response'
        })

      nock(httpClient.authenticator.environment.baseUrl)
        .post('/some-url')
        .reply(200, {
          some: 'response'
        })
    })

    it('sends a get http request with correct parameters', () => {
      const spy = jest.spyOn(Request, 'get')
      return httpClient.performGet('/some-url').then(() => {
        expect(spy).toHaveBeenCalledWith(
          {'headers': {'Authorization': 'Bearer new-token', 'Content-Type': 'application/json', 'User-Agent': 'stuart-client-js/' + PackageJson.version},
            'url': 'https://sandbox-api.stuart.com/some-url'},
          expect.anything())
      })
    })

    it('sends a get http request with correct query string parameters', () => {
      const spy = jest.spyOn(Request, 'get')
      const params = {param1: 'one', param2: 'two'}
      return httpClient.performGet('/some-url', params).then(() => {
        expect(spy).toHaveBeenCalledWith(
          {'headers': {'Authorization': 'Bearer new-token', 'Content-Type': 'application/json', 'User-Agent': 'stuart-client-js/' + PackageJson.version},
            'url': 'https://sandbox-api.stuart.com/some-url',
            'qs': {'param1': 'one', 'param2': 'two'}
          },
          expect.anything()
        )
      })
    })
  })

  describe('HttpClient#performPost', () => {
    beforeEach(() => {
      httpClient = new HttpClient(authenticator)

      nock(httpClient.authenticator.environment.baseUrl)
        .post('/some-url')
        .reply(200, {
          some: 'response'
        })

      nock(httpClient.authenticator.environment.baseUrl)
        .post('/some-url-that-returns-null-body')
        .reply(204)
    })

    it('sends a post http request with correct parameters', () => {
      const spy = jest.spyOn(Request, 'post')
      return httpClient.performPost('/some-url', JSON.stringify({some: 'body'})).then(() => {
        expect(spy).toHaveBeenCalledWith(
          {'headers': {'Authorization': 'Bearer new-token', 'Content-Type': 'application/json', 'User-Agent': 'stuart-client-js/' + PackageJson.version},
            'url': 'https://sandbox-api.stuart.com/some-url',
            'body': '{"some":"body"}'},
          expect.anything()
        )
      })
    })

    it('handles null response bodies', () => {
      const spy = jest.spyOn(Request, 'post')
      return httpClient.performPost('/some-url-that-returns-null-body').then(() => {
        expect(spy).toHaveBeenCalledWith(
          {'headers': {'Authorization': 'Bearer new-token', 'Content-Type': 'application/json', 'User-Agent': 'stuart-client-js/' + PackageJson.version},
            'url': 'https://sandbox-api.stuart.com/some-url-that-returns-null-body'},
          expect.anything()
        )
      })
    })
  })
})
