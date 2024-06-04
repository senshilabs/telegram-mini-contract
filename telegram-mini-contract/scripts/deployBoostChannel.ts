import { toNano } from '@ton/core';

import { BoostChannelParent } from '../wrappers/BoostChannelParent';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const boostChannel = provider.open(await BoostChannelParent.fromInit());

    console.log('Deploying BoostChannelParent at ', boostChannel.address);
    
    
    if ((await provider.isContractDeployed(boostChannel.address))) {
        console.log('Already deployed at', boostChannel.address);

        
        return;
    }

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
    console.log('Deployed BoostChannel at', boostChannel.address);
    
}
