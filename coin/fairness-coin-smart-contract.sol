// SPDX-License-Identifier: AGPL-3.0 license
pragma solidity ^0.8.2;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v4.6/contracts/token/ERC20/ERC20.sol";


contract FairnessCoinSmartContract is ERC20 {


    address[] fairnessFans = [0x414a6ace81a5336540506f852bCAb301891058fa];
    mapping(address => bool) fanIsRegistered;
    uint startTime = block.timestamp;
    uint minuteOfLastMint = 0;


    constructor() ERC20("FairnessCoin", "FC") { 
        fanIsRegistered[0x414a6ace81a5336540506f852bCAb301891058fa] = true;
    }


    function registerFan(address fanAddress) public {

        require(fanIsRegistered[fanAddress] == false);
        fairnessFans.push(fanAddress);
        fanIsRegistered[fanAddress] = true;

    }


    function mintOneCoinPerRegisteredFan() public {

        require(minuteOfLastMint < getMinutesPassed(), "I also love Cash because it represents freedom - still you shall be patient.");
        minuteOfLastMint = getMinutesPassed();

        uint256 counter = 0;

        while (counter < fairnessFans.length) {
            _mint(fairnessFans[counter], 1 * 10 ** decimals());
            counter = counter + 1;
        }

    }


    function getMinutesPassed() public view returns(uint){
        return (block.timestamp - startTime)/(1 minutes);
    }


}
