
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthMarketPlace {
    address public owner;
    uint256 public ethPrice;
    uint256 public btcPrice;
    uint256 public bnbPrice;

    enum Currency { ETH, BTC, BNB }

    event Purchased(address buyer, Currency currency, uint256 amount);
    event Sold(address seller, Currency currency, uint256 amount);

    constructor(uint256 _ethPrice, uint256 _btcPrice, uint256 _bnbPrice) {
        owner = msg.sender;
        ethPrice = _ethPrice;
        btcPrice = _btcPrice;
        bnbPrice = _bnbPrice;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    // Function to set the price of ETH, BTC, and BNB
    function setPrices(uint256 _ethPrice, uint256 _btcPrice, uint256 _bnbPrice) public onlyOwner {
        ethPrice = _ethPrice;
        btcPrice = _btcPrice;
        bnbPrice = _bnbPrice;
    }

    // Function to buy tokens (ETH, BTC, BNB)
    function buy(Currency _currency) public payable {
        require(msg.value > 0, "Send some ETH to buy");

        uint256 amount;
        if (_currency == Currency.ETH) {
            amount = msg.value / ethPrice;
        } else if (_currency == Currency.BTC) {
            amount = msg.value / btcPrice;
        } else if (_currency == Currency.BNB) {
            amount = msg.value / bnbPrice;
        }

        emit Purchased(msg.sender, _currency, amount);
    }

    // Function to sell tokens (ETH, BTC, BNB)
    function sell(Currency _currency, uint256 _amount) public {
        require(_amount > 0, "Specify an amount to sell");

        uint256 value;
        if (_currency == Currency.ETH) {
            value = _amount * ethPrice;
        } else if (_currency == Currency.BTC) {
            value = _amount * btcPrice;
        } else if (_currency == Currency.BNB) {
            value = _amount * bnbPrice;
        }

        payable(msg.sender).transfer(value);
        emit Sold(msg.sender, _currency, _amount);
    }

    // Function to withdraw contract balance (only owner)
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}

