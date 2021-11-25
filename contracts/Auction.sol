// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract Auction {
    uint256 public highestBid;

    event Bid(uint256 amount, address bidder);

    function bid() public payable {
        require(msg.value > highestBid, "Amount lower than highest bid");

        highestBid = msg.value;

        emit Bid(msg.value, msg.sender);
    }
}
