pragma solidity ^0.6.0;

import '@openzeppelin/contracts/access/Ownable.sol';

abstract contract TokenInterface {
    function balanceOf(address _owner) public virtual view returns (uint256 balance);
    function transferFrom(address _from, address _to, uint256 _value) public virtual returns (bool success);
}

contract ClaimToken is Ownable {

    mapping(uint256 => address) ksmToEth;
    mapping(uint256 => bool) tokenClaimed;
    mapping(uint256 => uint256) unclaimedToken;

    TokenInterface private token;

    constructor() public
    {
      token = TokenInterface(0xE24051d24Ba58369Dee4Ca7ECE8A66fD4A7cBb56); // Token contract address
    }

    function status(uint256 ksm) public view returns (address eth, bool claimed, uint256 balance)
    {
      return (ksmToEth[ksm], tokenClaimed[ksm], unclaimedToken[ksm]);
    }

    function setUnclaimedToken(uint256[] memory ksm, uint256[] memory amount) public onlyOwner returns (bool success) {
      require(ksm.length == amount.length, "bad input");

      for (uint256 i = 0; i < ksm.length; i++) {
        require(ksm[i] != 0, "invalid kusama address");

        unclaimedToken[ksm[i]] = amount[i];
      }

      return true;
    }

    function bindEthereumAddress(uint256 ksm, address eth) public onlyOwner returns (bool success) {
      require(ksm != 0, "invalid kusama address");
      require(eth != address(0), "invalid ethereum address");

      if (ksmToEth[ksm] == address(0)) {
        ksmToEth[ksm] = eth;
        tokenClaimed[ksm] = false;

        return true;
      }

      if (ksmToEth[ksm] != eth) {
        if (tokenClaimed[ksm] == true) {
          return false;
        }

        ksmToEth[ksm] = eth;
        tokenClaimed[ksm] = false;

        return true;
      }

      return true;
    }

    function unbind(uint256 ksm) public onlyOwner returns (bool success) {
      require(ksm != 0, "invalid kusama address");

      ksmToEth[ksm] = address(0);

      return true;
    }

    function claim(uint256 ksm) public returns (bool success) {
      require(ksm != 0, "invalid kusama address");
      require(ksmToEth[ksm] == msg.sender, "invalid ethereum account");
      require(tokenClaimed[ksm] == false, "token claimed");

      uint256 tokenValue = unclaimedToken[ksm];
      require(tokenValue > 0, "no unclaimable token");
      require(tokenValue <= token.balanceOf(owner()), "no enough tokens");
      unclaimedToken[ksm] = 0;
      token.transferFrom(owner(), msg.sender, tokenValue);
      tokenClaimed[ksm] = true;

      return true;
    }
}