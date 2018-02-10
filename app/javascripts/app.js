// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'
import betting_artifacts from '../../build/contracts/Betting.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);
var Betting = contract(betting_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);
    Betting.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
    

      self.refreshBalance();
    });

    var meta;  
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    web3.eth.getBalance(web3.eth.accounts[0], function(err, data){
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = data.c[0] / 10000;
    });

    var meta;

    Betting.deployed().then(function(instance){
      meta = instance;
      meta.isManager.call({from: account}).then(function(data){
        if(data[0]){
            if(data[1]){
              document.getElementById("isManDiv").style.display="block";
            }else{
              self.setStatus("No Bet to Resolve");
            }
        }else{
          Betting.deployed().then(function(instance){
            meta = instance;
            meta.getAddressOfBet.call({from: account}).then(function(data){
              console.log(data, account, web3.toWei(5, "ether"));
              if(data[0]){
                document.getElementById("betDiv").style.display="none";
                if(data[1]){
                  self.setStatus("You have already placed a bet on High");
                }else{
                  self.setStatus("You have already placed a bet on Low");
                }
              }else{
                document.getElementById("betDiv").style.display="block";
              }
            });;
          });
        }
      });
    });


 
  },

  putBet: function(type) {
    var self = this;

    //var amount = parseInt(document.getElementById("amount").value);
    //var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    Betting.deployed().then(function(instance) {
      meta = instance;
      return meta.putBet("Noida", type, {from: account, value: web3.toWei(5, "ether")});
    }).then(function() {
      self.setStatus("Bet Placed!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  resolveBet: function() {
    var self = this;
    var meta;
    Betting.deployed().then(function(instance){
      meta = instance;
      meta.callCallback({from: account});
      document.getElementById("isManDiv").style.display = "none";
      self.setStatus("Bet Resolved");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
