// SPDX-License-Identifier: AGPL-3.0 license
pragma solidity ^0.8.2;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v4.6/contracts/token/ERC20/ERC20.sol";

contract FairnessCoinSmartContract is ERC20 {


    address[] fairnessFans = [0x0000000000000000000000000000000000000000];
    mapping(address => bool) fanIsRegistered;
    uint startTime = block.timestamp;
    uint minuteOfLastMint = 0;


    constructor() ERC20("FairnessCoin", "FC") { }


    function registerFan(address fanAddress) public {
        // require(msg.sender == tbd, "Only a reasonable authentication smart contract shall be able to execute this function.")

        require(fanIsRegistered[fanAddress] == false, "The fan you tried to register is already registered.");
        fairnessFans.push(fanAddress);
        fanIsRegistered[fanAddress] = true;

    }


    function unRegisterFan(address fanAddress) public {
        // require(msg.sender == tbd, "Only a reasonable authentication smart contract shall be able to execute this function.")

        require(fanIsRegistered[fanAddress] == true, "The fan you tried to unregister, is not registered.");
        
        uint256 indexOfFanAddress = indexOf(fairnessFans, fanAddress);
        delete fairnessFans[indexOfFanAddress]; // in solidity this does not reduce the length of the array - it sets the corresponding entry to the initial value
        fanIsRegistered[fanAddress] = false;

    }


    function mintOneCoinPerRegisteredFan() public {

        require(minuteOfLastMint < getMinutesPassed(), "I also love Cash because it represents freedom - still you shall be patient.");
        minuteOfLastMint = getMinutesPassed();

        uint256 counter = 0;

        while (counter < fairnessFans.length) {

            if (fairnessFans[counter] != 0x0000000000000000000000000000000000000000) {
                _mint(fairnessFans[counter], 1 * 10 ** decimals());
                counter = counter + 1;
            }
        }

    }

    function getFanIsRegistered(address addressToBeChecked) external view returns (bool) {
        return fanIsRegistered[addressToBeChecked];
    }

    function getMinutesPassed() public view returns(uint){
        return (block.timestamp - startTime)/(1 minutes);
    }


    function indexOf(address[] memory array, address searchFor) private pure returns (uint256) {

        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == searchFor) {
                
              return i;
            }
        }

        // return -1; // cannot return -1 ... --> returning the max ...
        return 2**256 - 1;
    }

}
