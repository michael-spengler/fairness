// SPDX-License-Identifier: AGPL-3.0 license
pragma solidity ^0.8.2;



// Under Construction - Prototyping and Checking if RVLT might already accomplish what is also intended with this smart contract.




interface IFairnessCoinSmartContract {
    function getFanIsRegistered(address addressToBeChecked) external view returns (bool);
}

contract FairnessDAOSmartContract {

    struct challengeStruct {
        uint256 id;
        string description;
    }
    mapping(uint256 => challengeStruct) challenges;
    uint256 nextChallengeId = 1;


    struct proposalStruct {
        uint256 id;
        uint256 challengeID;
        string description;
        uint deadline; // blocknumber
        uint256 votesUp;
        uint256 votesDown;
        mapping(address => bool) voteStatus;
        bool countConducted;
        bool passed;
    }
    mapping(uint256 => proposalStruct) proposals;
    uint256 nextProposalId = 1; 

    struct proposalExtStruct {
        uint256 id;
        uint256 challengeID;
        string description;
        uint deadline; // blocknumber
        uint256 votesUp;
        uint256 votesDown;
        bool countConducted;
        bool passed;
    }

    IFairnessCoinSmartContract fairnessCoinSmartContract;


    constructor() {
        address smartContractAddressOfFairnessCoin = 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B;
        fairnessCoinSmartContract = IFairnessCoinSmartContract(smartContractAddressOfFairnessCoin);
    }


    function createChallenge(string memory description) public {
        require(fairnessCoinSmartContract.getFanIsRegistered(msg.sender) == true, "only registered fans can create challenges.");

        challengeStruct storage newChallenge = challenges[nextChallengeId];
        newChallenge.id = nextChallengeId;
        newChallenge.description = description;

        nextChallengeId = nextChallengeId + 1;
    }

    function createProposal(uint256 challengeID, string memory description) public {
        require(fairnessCoinSmartContract.getFanIsRegistered(msg.sender) == true, "only registered fans can create proposals.");
        require(challenges[challengeID].id > 0, "You should create a proposal for an existing challenge or create a challenge first.");

        proposalStruct storage newProposal = proposals[nextProposalId];
        newProposal.id = nextProposalId;
        newProposal.challengeID = challengeID;
        newProposal.description = description;
        newProposal.deadline = block.number + 100;
        newProposal.votesUp = 0;
        newProposal.votesDown = 0;
        newProposal.countConducted = false;
        newProposal.passed = false;

        nextProposalId = nextProposalId + 1;

    }


    function voteOnProposal(uint256 proposalId, bool voteUp) public {
        require(proposals[proposalId].id > 0, "The proposalId which you have provided, does not exist.");
        require(fairnessCoinSmartContract.getFanIsRegistered(msg.sender) == true, "only registered fans can vote on proposals.");
        require(proposals[proposalId].deadline >= block.number, "It seems the deadline for this proposal was already reached.");
        require(proposals[proposalId].voteStatus[msg.sender] == false, "It seems you have already voted on this proposal.");

        if (voteUp) {
            proposals[proposalId].votesUp++;
        } else {
            proposals[proposalId].votesDown++;
        }

        proposals[proposalId].voteStatus[msg.sender] = true;
    }


    function getChallenge(uint256 id) public view returns(challengeStruct memory) {
        return challenges[id];
    }

    function getProposal(uint256 id) public view returns(proposalExtStruct memory) {

        proposalExtStruct memory proposalExt;

        proposalExt.id = proposals[id].id;
        proposalExt.challengeID = proposals[id].challengeID;
        proposalExt.description = proposals[id].description;
        proposalExt.deadline = proposals[id].deadline;
        proposalExt.votesUp = proposals[id].votesUp;
        proposalExt.votesDown = proposals[id].votesDown;
        proposalExt.countConducted = proposals[id].countConducted;
        proposalExt.passed = proposals[id].passed;
        
        return proposalExt;
    }

    function getProposalIdsByChallengId(uint256 challengeId) public view returns(uint[] memory) {
        
        uint256 counter = 1;

        uint[] memory proposalIds = new uint[](100);

        while (proposals[counter].id != 0) {

            if (proposals[counter].challengeID == challengeId) {
                proposalIds[counter - 1] = proposals[counter].id;
            }
            counter++;
        }

        
        return proposalIds;
    }

}
