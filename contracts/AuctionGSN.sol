// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "./Auction.sol";

contract AuctionGSN is Auction, BaseRelayRecipient {
    string public override versionRecipient = "2.2.0";

    constructor(address forwarder) {
        _setTrustedForwarder(forwarder);
    }

    function _emitBidEvent() internal override {
        emit Bid(msg.value, _msgSender());
    }
}
