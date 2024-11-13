// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Fundraiser.sol";

contract FundraiserFactory {
    Fundraiser[] public fundraisers;
    mapping(address => address) public fundraiserToCreator; // 모금함 주소 -> 생성자 주소 매핑

    event FundraiserCreated(address fundraiserAddress, string fundraiserType);

    function createFundraiser(
        string memory _name, 
        uint256 _targetAmount,
        uint256 _finishTime,
        string memory _fundraiserType  // 모금함 타입
    ) public {
        Fundraiser newFundraiser = new Fundraiser(_name, _targetAmount, _finishTime, _fundraiserType);
        fundraisers.push(newFundraiser);
        fundraiserToCreator[address(newFundraiser)] = msg.sender; // 생성자 주소 저장
        emit FundraiserCreated(address(newFundraiser), _fundraiserType);
    }

    function getFundraisers() public view returns (Fundraiser[] memory) {
        return fundraisers;
    }
}