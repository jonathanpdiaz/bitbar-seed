const Amplify = require('aws-amplify').default;
const { Signer } = require('aws-amplify');
const { Auth, API } = Amplify;

Amplify.configure({
    Auth: {
        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: process.env.IDENTITY_POOL_ID,
        // REQUIRED - Amazon Cognito Region
        region: process.env.REGION,
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: process.env.USER_POOL_ID,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID
        ,
    },
    API: {
        endpoints: [
            {
                name: 'issues',
                endpoint: process.env.ENDPOINT,
                region: process.env.REGION,
            },
        ],
    },
});


async function issues({ app, envs, user, password }){
    await Auth.signIn(user, password);
    const promises = envs.map(env => API.get('issues', `${app}/stages/${env}/errors?mode=active`));
    const issues = Promise.all(promises);
    return issues;
}

module.exports = {
    issues
};

