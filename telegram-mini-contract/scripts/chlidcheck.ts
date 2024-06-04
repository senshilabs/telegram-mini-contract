import { toNano } from '@ton/core';

import { BoostChannelParent } from '../wrappers/BoostChannelParent';
import { BoostChannelChild } from '../wrappers/BoostChannelChild';

import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const boostChannel = provider.open(await BoostChannelParent.fromInit());

    console.log("address", boostChannel.address);
    let channelId = BigInt(-1001983857786);
    let itemId = BigInt(1);

    // const boostResult = await boostChannel.send(
    //         provider.sender(),
    //         {
    //             value: toNano('1'),
    //         },
    //         {
    //             $$type: 'Boost',
    //             channelId: channelId,
    //             itemId: itemId,
    //         }
    //     );

    let childAddress = await boostChannel.getChildAddress(channelId, itemId);
    console.log("child address", childAddress);
    let child = await boostChannel.getGetChild(channelId, itemId);

    
    let childContractChannel = provider.open(await BoostChannelChild.fromAddress(childAddress));
    console.log("child balance", await childContractChannel.getBalance());
    console.log(await childContractChannel.getIsBoosting());
    console.log(await childContractChannel.getGetBoostEndTime());
}
