import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BoostChannelParent } from '../wrappers/BoostChannelParent';
import { BoostChannelChild } from '../wrappers/BoostChannelChild';
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
      debugLogs: true,
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
    
    let channelId = BigInt(-101010101);
    let itemId = BigInt(1);

    console.log("balance before", await deployer.getBalance());
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

    
    let childContractChannel = blockchain.openContract(await BoostChannelChild.fromAddress(childAddress));
    console.log("balance after", await deployer.getBalance());
    console.log("child balance", await childContractChannel.getBalance());

    for (let i = 0; i < 10; i++) {
      await boostChannel.send(
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
  
      console.log("balance after2", await deployer.getBalance());
      console.log("child balance2", await childContractChannel.getBalance());
    }
    
  });

});
