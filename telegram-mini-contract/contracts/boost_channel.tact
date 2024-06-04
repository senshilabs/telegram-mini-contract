import "@stdlib/deploy";

message Boost {
    channelId: Int;
    itemId: Int as uint256;
}

message BoostEventMessage {
    message: String;
}
contract BoostChannelParent with Deployable {
    get fun childAddress(channelId: Int, itemId: Int): Address {
        return contractAddress(self.getChild(channelId, itemId));
    }

    get fun getChild(channelId: Int, itemId: Int): StateInit {
        return initOf BoostChannelChild(myAddress(), channelId, itemId);
    }

    receive(msg: Boost) {
        dump("BoostChannelParent.receive");
        
        let receivedTon: Int = context().value;
        require(receivedTon > ton("1"), "Received TON must be greater than 1 TON");
        require(receivedTon < ton("100"), "Received TON must be less than 100 TON");

        let child: StateInit = self.getChild(msg.channelId, msg.itemId);
        let additionalTime: Int =  self.calcAddTime(receivedTon);

        let childAddress: Address = contractAddress(child);
        let storageFee: Int = ton("0.01");

        emit(BoostEventMessage {
            message: "Boosting"
        }.toCell());

        send(SendParameters {
            to: childAddress,
            value: storageFee, // for storage fee with gas
            body: BoostTask {
                channelId: msg.channelId,
                itemId: msg.itemId,
                additionalTime: additionalTime
            }.toCell(),
            mode: 1,
            data: child.data,
            code: child.code
        });

        emit(BoostEventMessage {
            message: "Sended"
        }.toCell());
        
    }

    fun calcAddTime(receivedTon: Int): Int {
        return receivedTon * 1 * 24 * 60 * 60 * 10; // 0.1 TON = 1 day
    }
}

message BoostTask {
    channelId: Int;
    itemId: Int as uint256;
    additionalTime: Int as uint256;
}

contract BoostChannelChild with Deployable {
    parent: Address;
    channelId: Int as int256;
    itemId: Int as uint256;
    boostEndTime: Int as uint256;

    const minStorageFee: Int = ton("0.01");

    init(parent: Address, channelId: Int, itemId: Int) {
        self.parent = parent;
        self.channelId = channelId;
        self.itemId = itemId;
        self.boostEndTime = now(); // Initialize boostEndTime with the current time

        
    }

    receive(msg: BoostTask) {
        require(msg.channelId == self.channelId, "Invalid channelId");
        require(msg.itemId == self.itemId, "Invalid itemId");

        if (self.boostEndTime < now()) {
            self.boostEndTime = now();
        }

        self.boostEndTime += msg.additionalTime;


        // refund the remaining TON
        let refund: Int = context().value - self.minStorageFee;
        if (refund > 0) {
            send(SendParameters {
                to: self.parent,
                value: refund,
                mode: 0
            });
        }
        
    }

    get fun getBoostEndTime(): Int {
        return self.boostEndTime;
    }
    get fun getChannelId(): Int {
        return self.channelId;
    }
    get fun getItemId(): Int {
        return self.itemId;
    }
    get fun getParent(): Address {
        return self.parent;
    }
    get fun getMinStorageFee(): Int {
        return self.minStorageFee;
    }
    get fun isBoosting(): Bool {
        return self.boostEndTime > now();
    }
}
