// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiversToken is ERC20, Ownable {
    // 사용자가 토큰을 발행받은 시점을 기록
    mapping(address => uint256) private _mintedAt;
    // 최초로 발급받은 지갑 추적
    mapping(address => address) private _originalReceiver;

    // 토큰 전송을 비활성화(거래 불가능) 상태로 유지
    bool public transfersDisabled = true;

    // 투표 가능 여부 (7일 동안 가능)
    uint256 public constant VOTING_ELIGIBILITY_PERIOD = 7 days;

    // ERC20과 Ownable의 생성자에 인자 전달
    constructor() ERC20("GiversToken", "GIV") Ownable(msg.sender) {}

    // _update를 오버라이드하여 토큰 전송 비활성화 로직 추가
    function _update(address from, address to, uint256 amount) internal virtual override {
        if (transfersDisabled && from != address(0)) {
            revert("Token transfers are disabled");
        }
        super._update(from, to, amount);
        
        // 새로운 토큰 발행 시 (from이 0 주소일 때) 발행 시간 기록
        if (from == address(0)) {
            _mintedAt[to] = block.timestamp;
        }
    }

    // 기부 금액에 따라 토큰을 발행하는 함수
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 발행된 토큰이 투표에 사용 가능한지 확인 (발행 후 7일 이내)
    function isEligibleForVoting(address account) public view returns (bool) {
        return block.timestamp <= _mintedAt[account] + VOTING_ELIGIBILITY_PERIOD;
    }

    // 최초 발급자인지 확인하는 함수
    function isOriginalReceiver(address account) public view returns (bool) {
        return _originalReceiver[account] == account;
    }
    
    // 토큰 전송 활성화/비활성화 함수 (소유자만 호출 가능)
    function setTransfersDisabled(bool disabled) public onlyOwner {
        transfersDisabled = disabled;
    }
}