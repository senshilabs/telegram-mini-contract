import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BoostChannelParent } from '../wrappers/BoostChannelParent';
import { BoostChannelChild } from '../wrappers/BoostChannelChild';
import { ContractSystem } from '@tact-lang/emulator';
import '@ton/test-utils';
describe('BoostChannel', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let boostChannel: SandboxContract<BoostChannelParent>; // Import the actual contract

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    blockchain.verbosity = {
      print: true,
      blockchainLogs: false,
      vmLogs: 'none',
      debugLogs: false,
    }
    boostChannel = blockchain.openContract(await BoostChannelParent.fromInit());

    deployer = await blockchain.treasury('deployer');

    const deployResult = await boostChannel.send(
      deployer.getSender(),
      {
        value: toNano('0.05'),
      },
      {
        $$type: 'Deploy',
        queryId: 0n,
      }
    );

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: boostChannel.address,
      deploy: true,
      success: true,
    });
  });

  it('should deploy child', async () => {
    let cs = await ContractSystem.create();
    
    let channelId = BigInt(-101010101);
    let itemId = BigInt(1);
    
    let logger = cs.log(boostChannel.address);
    const boostResult = await boostChannel.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Boost',
                channelId: channelId,
                itemId: itemId,
            }
        );

    let childAddress = await boostChannel.getChildAddress(channelId, itemId);
    let child = await boostChannel.getGetChild(channelId, itemId);

    console.log(logger.collect());
    console.log(childAddress);
    //console.log(child);

    
    let childContractChannel = blockchain.openContract(await BoostChannelChild.fromAddress(childAddress));

    //console.log(childContractChannel);
    console.log(childContractChannel.address);

    // console.log(await childContractChannel.getGetMinStorageFee());
    // console.log(await childContractChannel.getIsBoosting());
    // console.log(await childContractChannel.getGetChannelId());
  });

});
