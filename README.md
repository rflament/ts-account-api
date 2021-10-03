
# Mongo Server

In order to run the service and the integration test, a mongo database is needed.

The service tries to connect to localhost on port 27017 (configured in app.js, this could be made configurable by env var).

The easiest way to launch mongo and to load the file accounts_large in the database is to use Docker. 

Run this command:

```
docker run --name some-mongo -p 27017:27017 -v "`pwd`/mongo":/docker-entrypoint-initdb.d/ -d mongo:latest
```

This will start a mongo database on port 27017 and execute scripts in directory "mongo":

- mongo/01-init-mongo.sh loads the file accounts_large.json in the database using mongoimport
- mongo/02-indexes.js creates indexes needed for performance


# Run Tests

Unit Tests are in directory test/unit
Integration Tests are in directory test/integration

To launch all tests and check coverage, run:

```
npm install
npm test
```

# Run Service

To run the service, execute this command:

```
npm install
npm start
```

It will start a server on port 8000 and connect to mongo database on localhost:27017

Examples:

```
#  Returns 40 results sorted by amount
curl "http://localhost:8000/?sort=amt&pageSize=40"

# Returns 4 results sorted by created date descending, in country CL
curl "http://localhost:8000/?sort=-createdDate&country=CL&pageSize=5" 

# Returns 4 results sorted by created date descending, in country CL and with name "John"
curl "http://localhost:8000/?sort=-createdDate&country=CL&name=John&pageSize=5" 
```


## Notes

- The dataset contains some "null" values (as string) for mfa field.  We could filter them, depending on business rules, but in the current implementation they are returned as-is.

- I used mongo cursor since the api could return a huge number of items and it would not fit in memory. However, I think the UI should not be allowed to return so many results, and if reporting is needed with so many rows, an asynchronous process that creates the CSV and uploads it to S3 would seem better suited to me.


