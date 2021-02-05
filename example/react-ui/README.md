This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## ERC20 Forwarder Approach (Forward) for meta transaction 
For more details please check this section
https://docs.biconomy.io/guides/enable-paying-gas-in-erc20

## Steps  
This exmaple is on Kovan test network and showcases how you can pay gas fees in DAI and USDT tokens
For using Ether provider or USDC check the branch https://github.com/bcnmy/metatx-standard/tree/erc20-forwarder-ethers-demo/example/react-ui/src

i) register your smart contract on the dashboard as ERC20 Forwarder
ii) register target method API
iii) follow the steps referring App.js and pay in tokens

## Actions

a) Submit with EIP712 - signature is requested in EIP712 format when user signs a message
b) Submit with Personal - signature is requested in personal sign format when user signs a message
c) send backend signed Tx - signs a message and sends a transaction using private key from the backend. Refer to SDK backend section in the docs 

## Note regarding Permit

You may use permit client to provide one time permit for spending DAI tokens from the user.

## Cost display 

Before you send out final request sendTxEIP712/sendTxPersonalSign, you will receive the cost from the built transaction which is the maximum amount of fees to be charged in particular tokens. If gas tokens are enabled these fees come down depending on the efficiency of burning gas tokens. 
https://medium.com/biconomy/gas-saving-by-biconomy-ea67d7e64d0c 

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:6005](http://localhost:6005) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
