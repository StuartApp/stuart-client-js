const clientOAuth2 = require('client-oauth2');
const request = require('request');
const packageJson = require('../package.json');

class ApiResponse {

    constructor(statusCode, body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    success() {
        return this.statusCode == (200 || 201)
    }
}

class Environment {

    static SANDBOX() {
        return {baseUrl: "https://sandbox-api.stuart.com"}
    }

    static PRODUCTION() {
        return {baseUrl: "https://api.stuart.com"}
    }
}

class Authenticator {

    constructor(environment, apiClientId, apiClientSecret) {
        this.environment = environment;
        this.oauthClient = new clientOAuth2({
            clientId: apiClientId,
            clientSecret: apiClientSecret,
            accessTokenUri: environment.baseUrl + "/oauth/token"
        })
    }

    getAccessToken() {
        let obj = this;
        return new Promise(function (resolve, reject) {
            if (obj.accessToken != null && !obj.accessToken.expired()) {
                resolve(obj.accessToken.accessToken);
            } else {
                obj.oauthClient.credentials.getToken().then(function (accessToken, error) {
                    obj.accessToken = accessToken;
                    resolve(obj.accessToken.accessToken);
                });
            }
        });
    }
}

class HttpClient {

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    performGet(resource, callback) {
        let obj = this;

        return new Promise(function (resolve, reject) {

            obj.authenticator.getAccessToken().then(function (accessToken, error) {

                let options = {
                    url: obj.url(resource),
                    headers: obj.defaultHeaders(accessToken)
                };

                request.get(options, function (err, res) {
                    resolve(new ApiResponse(res.statusCode, JSON.parse(res.body)));
                });
            });
        });
    };

    performPost(resource, body) {
        let obj = this;

        return new Promise(function (resolve, reject) {

            obj.authenticator.getAccessToken().then(function (accessToken, error) {

                let options = {
                    url: obj.url(resource),
                    headers: obj.defaultHeaders(accessToken),
                    body: body
                };

                request.post(options, function (err, res) {
                    resolve(new ApiResponse(res.statusCode, JSON.parse(res.body)));
                });
            });
        });
    };

    url(resource) {
        return this.authenticator.environment.baseUrl + resource
    }

    defaultHeaders(accessToken) {
        return {
            'Authorization': 'Bearer ' + accessToken,
            'User-Agent': 'stuart-client-js/' + packageJson.version,
            'Content-Type': 'application/json'
        }
    };
}

a = new Authenticator(Environment.SANDBOX(), "c6058849d0a056fc743203acb8e6a850dad103485c3edc51b16a9260cc7a7688", "aa6a415fce31967501662c1960fcbfbf4745acff99acb19dbc1aae6f76c9c619");
h = new HttpClient(a);

h.performGet('/v2/jobs/59701').then(function (apiResponse, error) {
    console.log(apiResponse)
});

let job = {
    "job": {
        "pickups": [
            {
                "address": "30 rue d'edimbourg 75008 paris",
                "comment": "Ask Bobby",
                "contact": {
                    "firstname": "Bobby",
                    "lastname": "Brown",
                    "phone": "+33610101010",
                    "email": "bobby.brown@pizzahut.com",
                    "company": "Pizza Hut"
                }
            }
        ],
        "dropoffs": [
            {
                "package_type": "small",
                "package_description": "The blue one.",
                "address": "Gare saint lazare",
                "comment": "2nd floor on the left",
                "contact": {
                    "firstname": "Dany",
                    "phone": "+33610101010",
                    "lastname": "Dan",
                    "company": "Sample Company Inc."
                }
            },
            {
                "package_type": "small",
                "package_description": "The blue one.",
                "address": "3 rue d'edimbourg 75008",
                "comment": "2nd floor on the left",
                "contact": {
                    "firstname": "Dany",
                    "phone": "+33610101010",
                    "lastname": "Dan",
                    "company": "Sample Company Inc."
                }
            }
        ]
    }
};

h.performPost('/v2/jobs', JSON.stringify(job)).then(function (apiResponse, error) {
    console.log(apiResponse);
});