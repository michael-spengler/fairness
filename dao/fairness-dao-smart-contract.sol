// SPDX-License-Identifier: AGPL-3.0 license
pragma solidity ^0.8.2;

contract FairnessDAO {

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


    mapping(address => bool) fanIsRegistered;


    constructor() {
        fanIsRegistered[msg.sender] = true;
    }


    function createChallenge(string memory description) public {
        require(fanIsRegistered[msg.sender] == true, "only registered fans can create challenges.");

        challengeStruct storage newChallenge = challenges[nextChallengeId];
        newChallenge.id = nextChallengeId;
        newChallenge.description = description;

        nextChallengeId = nextChallengeId + 1;
    }

    function createProposal(uint256 challengeID, string memory description) public {
        require(fanIsRegistered[msg.sender] == true, "Only registered fans can create proposals.");
        require(challenges[challengeID].id > 0, "You should create a proposal for an existing challenge or create a challenge first.");

        proposalStruct storage newProposal = proposals[nextProposalId];
        newProposal.id = nextProposalId;
        newProposal.challengeID = challengeID;
        newProposal.description = description;
        newProposal.deadline = block.number + 100;
        newProposal.votesUp = 0;
        newProposal.votesDown = 0;
        // mapping(address => bool) voteStatus;
        newProposal.countConducted = false;
        newProposal.passed = false;

        nextProposalId = nextProposalId + 1;

    }


    function voteOnProposal(uint256 proposalId, bool voteUp) public {
        require(proposals[proposalId].id > 0, "The proposalId which you have provided, does not exist.");
        require(fanIsRegistered[msg.sender] == true, "Only registered fans can create proposals.");
        require(proposals[proposalId].deadline >= block.number, "It seems the deadline for this proposal was already reached.");
        require(proposals[proposalId].voteStatus[msg.sender] == false, "It seems you have already voted on this proposal.");

        if (voteUp) {
            proposals[proposalId].votesUp++;
        } else {
            proposals[proposalId].votesDown++;
        }

        proposals[proposalId].voteStatus[msg.sender] = true;
    }

}
