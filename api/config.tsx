import {
    Configuration,
    SmartContractsApiInterface,
    SmartContractsApi,
    AccountsApi
  } from '@stacks/blockchain-api-client';

  import { urlStackNodeApi } from '../network-config';

const apiConfig: Configuration = new Configuration({
    fetchApi: fetch,
    basePath: urlStackNodeApi, // defaults to
  });

export const contractsApi: SmartContractsApiInterface = new SmartContractsApi(apiConfig);

export const getAllTxTransferAddressDone = async (address:string) => {
  console.log(address)
  if(address){
    const accountsApi = new AccountsApi(apiConfig);
    const txs = await accountsApi.getAccountTransactions({
      principal: address,
    });
    console.log('txs', txs);
  }
}
