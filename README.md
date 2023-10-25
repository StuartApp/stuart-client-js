[![Codeship Status for StuartApp/stuart-client-js](https://app.codeship.com/projects/47411ab0-b843-0137-a5ba-029fbc5fec2e/status?branch=master)](https://app.codeship.com/projects/364533)

# Stuart JS Client

For a complete documentation of all endpoints offered by the Stuart API, you can visit [Stuart API documentation](https://api-docs.stuart.com).

## Install
``` bash
$ npm install stuart-client-js --save
```

## Usage

### Initialize HTTP client

```javascript
const {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
} = require('stuart-client-js')

const environment = Environment.SANDBOX()
const api_client_id = 'XXXXXXX-XXXXXXXX-XXXXXXX' // can be found here: https://admin-sandbox.stuart.com/client/api
const api_client_secret = 'XXXXXXX-XXXXXXXX-XXXXXXX' // can be found here: https://admin-sandbox.stuart.com/client/api
const auth = new Authenticator(environment, api_client_id, api_client_secret)

const httpClient = new HttpClient(auth)
```

### Custom requests

#### Example: create a job

```javascript
const job = {
  job: {
    transport_type: "bike",
    pickups: [
      {
        address: "46 Boulevard Barbès, 75018 Paris",
        comment: "Wait outside for an employee to come.",
        contact: {
          firstname: "Martin",
          lastname: "Pont",
          phone: "+33698348756'",
          company: "KFC Paris Barbès"
        }
      }
    ],
    dropoffs: [
      {
        address: "156 rue de Charonne, 75011 Paris",
        package_description: "Red packet.",
        client_reference: "12345678ABCDE", // must be unique
        comment: "code: 3492B. 3e étage droite. Sonner à Durand.",
        contact: {
          firstname: "Alex",
          lastname: "Durand",
          phone: "+33634981209",
          company: "Durand associates."
        }
      }
    ]
  }
}

httpClient.performPost('/v2/jobs', JSON.stringify(job))
  .then((apiResponse) => { console.log(apiResponse) })
  .catch((error) => { console.log(error) })
```

#### Example: get a list of jobs

```javascript
httpClient.performGet('/v2/jobs')
  .then((apiResponse) => { console.log(apiResponse) })
  .catch((error) => { console.log(error) })
```
