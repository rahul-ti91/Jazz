# Betting Maker

With Betting maker one can bet either for high or low temperature then 13 degree in next 1 hour, 5 ethers will be deducted on placing bet and 10 ethers will be credited on winning the bet.

In the Dapp, there are two functionalities depending on the role of the user it'll be visible to them


## Available functionalities are:
1) Betting : visible to person role
2) Resolve Bet : contract owner (manager)


## Architecture

* Dapp is using etherium blockchain.
* To replicate the network, ganache-cli is used.
* To scaffold the project, compiling and migrating the contract to network truffle is used.
* To fetch the realtime temperature of Noida openweathermap API is used
* Oraclize is used to call the API inside the contract
* To test in local network etherium-bridge is used
* you may use wallet of your choice (I used Metamask
)
Node is server is not used as all the functionality is embedded in app.js

**Note:** *I have removed my api key from the url, kindly use yours (its free :) )*

## Steps to setup in your local
1) Clone Betting Dapp
2) Clone etherium bridge from https://github.com/oraclize/ethereum-bridge
3) npm install on both the clones 
4) start local network with command
`ganache-cli --mnemonic "your mnemonic of your choice" --accounts 9`
5) from inside etherium-bridge clone execute following command
`node bridge -a 7`
6) from inside Betting Dapp execute following command to migrate it to local network
`truffle migrate`
6) initiate webpack server 
`npm run dev`
7) open in browser **localhost:8080**