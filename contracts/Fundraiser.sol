// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FundraisingLib.sol";

contract Fundraiser {
    using FundraisingLib for FundraisingLib.Item;

    address public owner;
    string public name;
    uint256 public targetAmount;
    uint256 public finishTime;
    string public description;

    FundraisingLib.Item[] public items; // 모금에 사용될 물품 목록

    uint256 public raisedAmount = 0;
    mapping(address => uint256) public donations;

    // Constructor modified to include items for commodity type fundraisers
    constructor(
        string memory _name,
        uint256 _targetAmount,
        uint256 _finishTime,
        string memory _description,
        FundraisingLib.Item[] memory _items
    ) {
        owner = msg.sender;
        name = _name;
        targetAmount = _targetAmount;
        finishTime = _finishTime; // Directly use the Unix timestamp provided
        description = _description;
        for (uint i = 0; i < _items.length; i++) {
            items.push(_items[i]);
        }
    }

    function donate() external payable {
        require(block.timestamp < finishTime, "This fundraising is over");
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(raisedAmount > 0, "No funds to withdraw");
        
        uint256 amount = raisedAmount;
        raisedAmount = 0;
        
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send money");
    }

    function getInfo(address _address) public view returns (uint256) {
        require(donations[_address] > 0, "No Data"); 
        return donations[_address];
    }

    // Optional: Add a function to retrieve item details
    function getItem(uint index) public view returns (FundraisingLib.Item memory) {
        require(index < items.length, "Item index out of range");
        return items[index];
    }
}
