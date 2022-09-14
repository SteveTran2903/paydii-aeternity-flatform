import { StacksMocknet, StacksTestnet, StacksMainnet } from "@stacks/network";


// StacksMocknet: Using for local dev (localhost:3999)
// StacksTestnet: Using for testnet
// StacksMainnet: Using for mainnet


// for mainnet, 'https://stacks-node-api.mainnet.stacks.co' 
// testnet 'https://stacks-node-api.testnet.stacks.co' 
// local :  http://localhost:3999

// This data for testnet
let stackNetwork = StacksTestnet
let urlStackApi = "https://stacks-node-api.testnet.stacks.co"
let isMainnetInfo = false
// let addressContract = 'ST2VNTSDD188N95Q4QVKHCNXYTBQ7BHAX2E011M2H'
// let nameContract = 'paydiiv7'

let addressContract = 'ST2VNTSDD188N95Q4QVKHCNXYTBQ7BHAX2E011M2H'
let nameContract = 'paydiiv7'

console.log('network-config')

if(typeof window !== 'undefined') {
    if(localStorage.getItem('NETWORK_PAYDII') == 'mainnet'){
        stackNetwork = StacksMainnet
        urlStackApi = "https://stacks-node-api.mainnet.stacks.co"
        isMainnetInfo = true
        addressContract = 'SPKFWPTF18ZX2HN5XDAP1FRGN40SWWGFFPWMW628'
        nameContract = 'paydii-beta'
    }
}

export const currentNetwork = stackNetwork

export const contractOwnerAddress = addressContract // Local is ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

export const contractName = nameContract // local is 'paydii' 

export const fullContractOwnerAddressName = contractOwnerAddress + '.' + contractName

export const isMainnet = isMainnetInfo

export const urlStackNodeApi = urlStackApi

// example https://stacks-node-api.testnet.stacks.co/extended/v1/address/ST2VNTSDD188N95Q4QVKHCNXYTBQ7BHAX2E011M2H.paydiiv6
export const urlStackNodeApiV1Contract = urlStackNodeApi + "/extended/v1/address/"+ fullContractOwnerAddressName

export const urlStackNodeApiV1Adress = urlStackNodeApi + "/extended/v1/address"

export const urlStackNodeApiV1Tx  = urlStackNodeApi + "/extended/v1/tx"