pragma solidity ^0.5.16;
import './SafeMath.sol';

contract TokenInterface {
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
}

contract ClaimToken {
    using SafeMath for uint256;

    mapping(uint256 => address) ksmToEth;
    mapping(uint256 => bool) claimed;
    mapping(uint256 => uint256) unclaimedToken;

    TokenInterface private token;

    address private owner;

    constructor() public
    {
      token = TokenInterface(0x6c1E38226eFD562cBabA09d59976866fA21263ab); // Token contract address
      owner = msg.sender;
    }

    function status(uint256 ksm) public view returns (address eth, bool claimed, uint256 balance)
    {
      return (ksmToEth[ksm], claimed[ksm], unclaimedToken[ksm]);
    }

    function setUnclaimedToken(uint256[] memory ksm, uint256[] memory amount) public returns (bool success) {
      require(msg.sender == owner, "not contract owner");
      require(ksm.length == amount.length, "bad input");

      for (uint256 i = 0; i < ksm.length; i++) {
        require(ksm[i] != 0, "invalid kusama address");

        unclaimedToken[ksm[i]] = amount[i];
      }

      return true;
    }

    function bindEthereumAddress(uint256 ksm, address eth) public returns (bool success) {
      require(owner == msg.sender, "not contract owner");
      require(ksm != 0, "invalid kusama address");
      require(eth != address(0), "invalid ethereum address");

      if (ksmToEth[ksm] == address(0)) {
        ksmToEth[ksm] = eth;
        claimed[ksm] = false;

        return true;
      }

      if (ksmToEth[ksm] != eth) {
        if (claimed[ksm] == true) {
          return false;
        }

        ksmToEth[ksm] = eth;
        claimed[ksm] = false;

        return true;
      }

      return true;
    }

    function unbind(uint256 ksm) public returns (bool success) {
      require(owner == msg.sender, "not contract owner");
      require(ksm != 0, "invalid kusama address");

      ksmToEth[ksm] = address(0);

      return true;
    }

    function claim(uint256 ksm) public returns (bool success) {
      require(ksm != 0, "invalid kusama address");
      require(ksmToEth[ksm] == msg.sender, "invalid ethereum account");
      require(claimed[ksm] == false, "token claimed");

      uint256 tokenValue = unclaimedToken[ksm];
      require(tokenValue > 0, "no unclaimable token");
      require(tokenValue <= token.balanceOf(owner), "no enough balance");
      unclaimedToken[ksm] = 0;
      token.transferFrom(owner, msg.sender, tokenValue);
      claimed[ksm] = true;

      return true;
    }
}