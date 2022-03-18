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
   >```
   > REGION =
   > IDENTITY_POOL_ID =
   > USER_POOL_ID=
   > USER_POOL_WEB_CLIENT_ID =
   > ENDPOINT =
   > APPS = [ { "app": {{app}}, "user": {{user}}, "password": {{password}}, "envs":[ "dev", "staging", "prod", {{env}} ] }, ..., {} ]
