```
Steps to run:
  1. npm install
  2. Create a .env file
  3. Create a variable with name "API_KEY" and put your api key value there.
  4. npm start
```

### Using Redis as Cache.

This API uses Redis to cache results every 5 minutes. We are storing the result as a stringified json in redis and
then parse it when needed.

As we don't want to share the API KEY, we use dotenv package to secure keys.
