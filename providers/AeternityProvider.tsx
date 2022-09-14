import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection, Universal, TxBuilder,
} from '../js-sdk/es/index.mjs'

import createPersistedState from 'use-persisted-state';

const useCounterStateWalletUser = createPersistedState('walletUser');
const useCounterStateAddress = createPersistedState('address');

import INFO_DEPLOY from "../deploy/Paydii.aes.deploy.json"

interface AeternityContextValue {
  sdkAeternity: any,
  contractInstance: null,
  walletUser: any,
  address?: string,
  handleLogIn: () => void,
  handleLogOut: () => void,
}

const AeternityContext = createContext<AeternityContextValue | undefined>(undefined);

export default function AeternityProvider({ children }: PropsWithChildren<{}>) {
  const [sdkAeternity, setSdkAeternity] = useState<Object>({});
  const [contractInstance, setContractInstance] = useState(null);
  const [walletUser, setWalletUser] = useCounterStateWalletUser(null);
  const [address, setAddress] = useCounterStateAddress('')
  

  const initContractInfo = async () => {
    const nodes = [];
    nodes.push({
      name: 'testnet',
      // eslint-disable-next-line no-await-in-loop
      instance: await Node({ url: 'https://testnet.aeternity.io' }),
    });
   

    // init contract
    const client = await RpcAepp({
      name: 'AEPP',
      nodes: nodes,
      compilerUrl: 'https://compiler.aepps.com',
      // call-back for update network notification
      onNetworkChange (params:any) {
        if (this.getNetworkId() !== params.networkId) alert(`Connected network ${this.getNetworkId()} is not supported with wallet network ${params.networkId}`)
      },
      // call-back for update address notification
      onAddressChange:  async (addresses:any) => {
        console.log('addresses change',addresses)
        // let pub = await this.client.address()
        // this.balance = await this.client.balance(this.pub).catch(e => '0')
        // this.addressResponse = await errorAsField(this.client.address())
      },
      // call-back for update address notification
      onDisconnect (msg:any) {
        alert(msg)
      }
    })

    console.log('client', client)
    
    sdkAeternity = client
    setSdkAeternity(client)

    // Get contract instance
    let aci = JSON.stringify(INFO_DEPLOY.aci); // obtain and save the ACI

    let contractAddress = INFO_DEPLOY.address; // obtain and save the contract address
    console.log(contractAddress);

    const contractIns = await sdkAeternity.getContractInstance(
      {aci: JSON.parse(aci), contractAddress}
    );
    console.log('contractIns', contractIns);

    contractInstance = contractIns
    let copy = Object.assign({},contractIns)
    // let temp= JSON.parse(JSON.stringify(contractIns))
    setContractInstance(copy)
  }

  useEffect(() => {
    console.log('init contract')
    initContractInfo()
  }, []);

  const handleLogIn = async () => {
      // Start looking for wallets
    await scanForWallets() // Start looking for new wallets
  }

  const handleLogOut = async () => {
    setAddress(null)
    setWalletUser(null)
    // let logout = await sdkAeternity.disconnectWallet(false); 
    // console.log('logout',logout)
  }

  const connectToWallet = async (wallet:any) =>  {
    // Connect to the wallet using wallet connection object
    // At this line sdk will send connection request to the wallet and waiting for response
    console.log('wallet', wallet)
    console.log('client', sdkAeternity);
  
    let test = await sdkAeternity.connectToWallet( await wallet.getConnection())

    // After connection established we can subscribe for accounts
    let accounts = await sdkAeternity.subscribeAddress('subscribe', 'connected')
    // Now we have list of available account and we can get the selected account just using usual SDK interface
    let selectedAccountAddress = await sdkAeternity.address()
    // In `client.rpcClient` you can find all information regarding to connected waellet

    walletUser = wallet
    let temp = JSON.parse(JSON.stringify(wallet))
    setWalletUser(temp)

    let info =  sdkAeternity.rpcClient.getCurrentAccount()
    console.log('info',info)
    setAddress(info)

    let walletName = sdkAeternity.rpcClient.info.name
    console.log('walletName',walletName);
}

  const scanForWallets = async () => {
    // call-back function for new wallet event
    const handleWallets = async function ({ wallets, newWallet }) {
      newWallet = newWallet || Object.values(wallets)[0]
      // ask if you want to connect
      if (confirm(`Do you want to connect to wallet ${newWallet.name}`)) {
        // Stop scanning wallets
        detector.stopScan()
        // Connect to wallet
        await connectToWallet(newWallet)
      }
    }

    // Create connection object for WalletDetector
    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' }
    })
    // Initialize WalletDetector 
    const detector = await WalletDetector({ connection: scannerConnection })
    // Start scanning
    detector.scan(handleWallets.bind(this))
}


  const value: AeternityContextValue = { sdkAeternity, contractInstance, walletUser, address, handleLogIn, handleLogOut };

  return (
    <AeternityContext.Provider value={value}>
      {children}
    </AeternityContext.Provider>
  )
}

export function useAeternity() {
  const context = useContext(AeternityContext);
  if (context === undefined) {
    throw new Error('useAeternity must be used within a AeternityProvider');
  }
  return context;
}