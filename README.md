# Widget Seed

Bit Bar script to display current issues on seed.

## Get bitbar

https://github.com/matryer/bitbar

## Instalation steps

1. Clone the project.
2. Link the main file from your Bit Bar plugin folder.
   - `cd /Users/bitbar-plugins`
   - `ln -s /Users/bitbar-seed/index.js bitbar-seed.5m.js`
   - Alternatively, to change the execution frequency, use: `ln -s /Users/bitbar-seed/bitbar-seed.5m.js bitbar-seed.10m.js`
3. Define an enviroment file named `env.bitbar-seed` on your plugin folder.
   
> Required fields:
```   
   { 
      "cognito": {
            "identityPoolId": "us-east-1:7750a6bc-adb7-480d-9d5b-1a0ff55b8001",
            "region": "us-east-1",
            "userPoolId": "us-east-1_44AK9Jk0I",
            "userPoolWebCliendId": "l1t7f7la2lh57m8e40v9gb5ts",
            "endpoint": "https://y70m3ridv5.execute-api.us-east-1.amazonaws.com/prod/"
         },
      "apps": [
         {
               "app": "your-app",
               "envs": [
                  "your",
                  "stages",
                  "here"
               ],
               "user": "user",
               "password": "password"
         },...
      ]
   }