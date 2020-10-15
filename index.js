const ClientOAuth2 = require('client-oauth2')
const Request = require('request')
const PackageJson = require('./package.json')

class Environment {
  static SANDBOX () {
    return {
      baseUrl: 'https://sandbox-api.stuart.com'
    }
  }

  static PRODUCTION () {
    return {
      baseUrl: 'https://api.stuart.com'
    }
  }
}

class Authenticator {
  constructor (environment, apiClientId, apiClientSecret) {
    this.environment = environment
    this.oauthClient = new ClientOAuth2({
      clientId: apiClientId,
      clientSecret: apiClientSecret,
      accessTokenUri: environment.baseUrl + '/oauth/token'
    })
  }

  getAccessToken () {
    return new Promise((resolve, reject) => {
      if (this.accessToken != null && !this.accessToken.expired()) {
        resolve(this.accessToken.accessToken)
      } else {
        this.oauthClient.credentials.getToken().then((accessToken) => {
          this.accessToken = accessToken
          resolve(this.accessToken.accessToken)
        }).catch(error => { reject(error) })
      }
    })
  }
}

class ApiResponse {
  constructor (statusCode, body, headers) {
    this.statusCode = statusCode
    this.body = body
    this.headers = headers
  }

  success () {
    return this.statusCode >= 200 && this.statusCode < 300
  }
}

class HttpClient {
  constructor (authenticator) {
    this.authenticator = authenticator
  }

  performGet (resource, params) {
    return new Promise((resolve, reject) => {
      this.authenticator.getAccessToken().then((accessToken) => {
        let options = {
          url: this.url(resource),
          headers: this.defaultHeaders(accessToken)
        }
        if (params) options.qs = params

        Request.get(options, (err, res) => resolve(
          new ApiResponse(res.statusCode, JSON.parse(res.body), res.headers)))
      }).catch(error => { reject(error) })
    })
  };

  performPost (resource, body) {
    return new Promise((resolve, reject) => {
      this.authenticator.getAccessToken().then((accessToken) => {
        let options = {
          url: this.url(resource),
          headers: this.defaultHeaders(accessToken),
          body: body
        }

        Request.post(options, (err, res) => resolve(
          new ApiResponse(res.statusCode, JSON.parse(res.body || '{}'), res.headers)))
      }).catch(error => { reject(error) })
    })
  };

  url (resource) {
    return this.authenticator.environment.baseUrl + resource
  }

  defaultHeaders (accessToken) {
    return {
      'Authorization': 'Bearer ' + accessToken,
      'User-Agent': 'stuart-client-js/' + PackageJson.version,
      'Content-Type': 'application/json'
    }
  }
}

module.exports = {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
}
