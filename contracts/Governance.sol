// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GiversToken.sol";

contract Governance {
    GiversToken public giversToken;

    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        mapping(address => bool) voted;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed id, string description);
    event Voted(uint256 indexed id, address indexed voter, bool support);

    constructor(address _giversToken) {
        giversToken = GiversToken(_giversToken);
    }

    function createProposal(string memory description) public returns (uint256) {
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.description = description;
        emit ProposalCreated(proposalCount, description);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.voted[msg.sender], "You have already voted");
        require(giversToken.isEligibleForVoting(msg.sender), "You are not eligible to vote");
        require(giversToken.isOriginalReceiver(msg.sender), "You are not the original token receiver");

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        proposal.voted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        if (proposal.votesFor > proposal.votesAgainst) {
            // Execute proposal logic (e.g., change contract state)
            proposal.executed = true;
        }
    }
}