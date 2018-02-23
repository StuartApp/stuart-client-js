const clientOAuth2 = require('client-oauth2');
const request = require('request');
const packageJson = require('../package.json');

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
        return new Promise((resolve, reject) => {
            if (this.accessToken != null && !this.accessToken.expired()) {
                resolve(this.accessToken.accessToken);
            } else {
            this.oauthClient.credentials.getToken().then((accessToken) => {
                this.accessToken = accessToken;
                resolve(this.accessToken.accessToken);
            }).catch(error => console.log(error));
            }
        })
    }
}

class ApiResponse {

    constructor(statusCode, body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    success() {
        return this.statusCode == (200 || 201)
    }
}

class HttpClient {

    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    performGet(resource, callback) {
        return new Promise((resolve, reject) => {

            this.authenticator.getAccessToken().then((accessToken) => {

                let options = {
                    url: this.url(resource),
                    headers: this.defaultHeaders(accessToken)
                };

                request.get(options, (err, res) => resolve(new ApiResponse(res.statusCode, JSON.parse(res.body))));

            }).catch(error => console.log(error));
        });
    };

    performPost(resource, body) {
        return new Promise((resolve, reject) => {

            this.authenticator.getAccessToken().then((accessToken) => {

                let options = {
                    url: this.url(resource),
                    headers: this.defaultHeaders(accessToken),
                    body: body
                };

                request.post(options, (err, res) => resolve(new ApiResponse(res.statusCode, JSON.parse(res.body))));

            }).catch(error => console.log(error));
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

h.performPost('/v2/jobs', JSON.stringify(job)).then(function (apiResponse) {
    console.log(apiResponse);
}).catch(error => console.log(error));

h.performGet('/v2/jobs/59701').then(function (apiResponse) {
    console.log(apiResponse)
}).catch(error => console.log(error));
