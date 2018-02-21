const clientOAuth2 = require('client-oauth2');
const request = require('request');
const packageJson = require('../package.json');


const SANDBOX = {base_url: "https://sandbox-api.stuart.com"};
const PRODUCTION = {base_url: "https://api.stuart.com"};

function HttpClient(authenticator) {
    this.authenticator = authenticator;
}

HttpClient.prototype.performGet = function (resource, callback) {
    var obj = this;

    obj.authenticator.getAccessToken().then(function (accessToken, error) {

        var options = {
            url: obj.url(resource),
            headers: obj.defaultHeaders(accessToken)
        };

        request.get(options, function(err, res) {
            callback(new ApiResponse(res.statusCode, JSON.parse(res.body)));
        });
    });
};

HttpClient.prototype.performPost = function (resource, body, callback) {
    var obj = this;

    obj.authenticator.getAccessToken().then(function (accessToken, error) {

        var options = {
            url: obj.url(resource),
            headers: obj.defaultHeaders(accessToken),
            body: body
        };

        request.post(options, function(err, res) {
            callback(new ApiResponse(res.statusCode, JSON.parse(res.body)));
        });
    });
};

HttpClient.prototype.url = function(resource) {
    return this.authenticator.environment.base_url + resource
};

HttpClient.prototype.defaultHeaders = function(accessToken) {
    return {
        'Authorization': 'Bearer ' + accessToken,
        'User-Agent': 'stuart-client-js/' + packageJson.version,
        'Content-Type': 'application/json'
    }
};

function ApiResponse(statusCode, body) {
    this.statusCode = statusCode;
    this.body = body;
}

ApiResponse.prototype.success = function() {
    return this.statusCode == (200 || 201)
};

function Authenticator(environment, apiClientId, apiClientSecret) {
    this.environment = environment;
    this.oauth_client = new clientOAuth2({
        clientId: apiClientId,
        clientSecret: apiClientSecret,
        accessTokenUri: environment.base_url + "/oauth/token"
    })
}

Authenticator.prototype.getAccessToken = function () {
    var obj = this;
    return new Promise(function (resolve, reject) {
        if (obj.accessToken != null && !obj.accessToken.expired()) {
            resolve(obj.accessToken.accessToken);
        } else {
            obj.oauth_client.credentials.getToken().then(function (accessToken, error) {
                obj.accessToken = accessToken;
                resolve(obj.accessToken.accessToken);
            });
        }
    });
};

// some examples here
a = new Authenticator(SANDBOX, "c6058849d0a056fc743203acb8e6a850dad103485c3edc51b16a9260cc7a7688", "aa6a415fce31967501662c1960fcbfbf4745acff99acb19dbc1aae6f76c9c619");
h = new HttpClient(a);

h.performGet('/v2/jobs/59701', function (apiResponse) {
    console.log(apiResponse)
});

var job = {
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

h.performPost('/v2/jobs', JSON.stringify(job), function (apiResponse) {
    console.log(apiResponse)
});
