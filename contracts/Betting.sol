pragma solidity ^0.4.17;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

//** if import is not working copy and paste oraclize contract from github
// also please replace <api_key> with your registered apikey its free :)

contract Betting is usingOraclize {
    uint private betSeq = 1;
    uint private betTemperature = 13;
    uint private actualTemperature = 14;
    uint public result_temp;
    address private manager;
    struct Bet {
        uint id;
        address hiBy;
        address loBy;
        bytes32 city;
        Status status;
    }   

    enum Status {CREATED, PENDING, RESOLVED}

    mapping(uint => Bet) private bets;

    function Betting() {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        manager = msg.sender;
    }
    function putBet(bytes32 city, bool hiBet) payable public {
        require(msg.value == 5000000000000000000);
        if (bets[betSeq].status == Status.RESOLVED) {
            betSeq++;
        }
        if (hiBet && bets[betSeq].hiBy == 0) {
            bets[betSeq].hiBy = msg.sender;
        }else if (!hiBet && bets[betSeq].loBy == 0) {
            bets[betSeq].loBy = msg.sender;
        }
        bets[betSeq].id = betSeq;
        bets[betSeq].city = city;
        if (bets[betSeq].hiBy > 0 && bets[betSeq].loBy > 0) {
            bets[betSeq].status = Status.PENDING;
        }else {
            bets[betSeq].status = Status.CREATED;
        }   
    }

    function resolveBet() private returns(bool) {
        if (bets[betSeq].status == Status.PENDING) {
            if (betTemperature > actualTemperature) {
                bets[betSeq].hiBy.transfer(this.balance);
                // high bidder wins
            }else if (betTemperature < actualTemperature) {
                bets[betSeq].loBy.transfer(this.balance);
                // low bidder wins
            } else {
                bets[betSeq].hiBy.transfer(this.balance / 2);
                bets[betSeq].loBy.transfer(this.balance / 2);
                // Draw
            }
            bets[betSeq].status = Status.RESOLVED;
            return true;
        } 
        return false;  
    }

    function stringToUint(string s) constant returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

    function callCallback() payable {
        require(msg.sender == manager);
        oraclize_query("URL", "json(http://api.openweathermap.org/data/2.5/weather?zip=201304,in&appid=<api_key>&units=metric).main.temp");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
        result_temp = stringToUint(result);
        resolveBet(); 
    }

    function getBetData(uint betId) public constant returns(uint, address, address, bytes32, Status) {
        return (bets[betId].id, bets[betId].hiBy, bets[betId].loBy, bets[betId].city, bets[betId].status);
    }

    function isManager() public constant returns(bool, bool) {
        if (manager == msg.sender) {
            if (bets[betSeq].status == Status.PENDING) {
                return (true, true);
            }else {
                return (true, false);
            }
        }else {
            return (false, false);
        }
    }

    function getAddressOfBet() public constant returns(bool, bool) {
        if (msg.sender == bets[betSeq].hiBy && bets[betSeq].status != Status.RESOLVED) {
            return (true, true);
        }else if (msg.sender == bets[betSeq].loBy && bets[betSeq].status != Status.RESOLVED) {
            return (true, false);
        }else {
            return (false, false);
        }
    }

    function getBalance() public constant returns(uint) {
        return this.balance;
    }
}