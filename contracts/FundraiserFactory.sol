// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Fundraiser.sol";
import "./FundraisingLib.sol";

contract FundraiserFactory {
    using FundraisingLib for FundraisingLib.Item;

    Fundraiser[] public fundraisers;
    event FundraiserCreated(address fundraiserAddress);

    function createFundraiser(
        string memory _name,
        uint256 _targetAmount,
        uint256 _finishTime,
        string memory _description,
        FundraisingLib.Item[] memory items
    ) public {
        Fundraiser newFundraiser = new Fundraiser(_name, _targetAmount, _finishTime, _description, items);
        fundraisers.push(newFundraiser);
        emit FundraiserCreated(address(newFundraiser));
    }

    function getFundraisers() public view returns (Fundraiser[] memory) {
        return fundraisers;
    }
}
