const Amplify = require('aws-amplify').default;
const { Signer } = require('aws-amplify');
const { Auth, API } = Amplify;
const { cognito } = require('./env.bitbar-seed.json')

Amplify.configure({
    Auth: {
        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: cognito.identityPoolId,
        // REQUIRED - Amazon Cognito Region
        region: cognito.region,
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: cognito.userPoolId,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: cognito.userPoolWebClientId
    },
    API: {
        endpoints: [
            {
                name: 'issues',
                endpoint: cognito.endpoint,
                region: cognito.region,
            },
        ],
    },
});


async function issues({ app, envs, user, password }) {
    try {
        await Auth.signIn(user, password);
        const promises = envs.map(env => API.get('issues', `${app}/stages/${env}/errors?mode=active`));
        const issues = Promise.all(promises);
        return issues;
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    issues
};

