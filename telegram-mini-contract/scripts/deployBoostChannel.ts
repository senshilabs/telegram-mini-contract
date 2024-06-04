import { toNano } from '@ton/core';
import { BoostChannel } from '../wrappers/BoostChannelParent';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const boostChannel = provider.open(await BoostChannel.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await boostChannel.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(boostChannel.address);

    console.log('ID', await boostChannel.getId());
}
