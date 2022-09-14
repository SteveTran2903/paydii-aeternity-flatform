
// import { urlStackNodeApiV1Adress, urlStackNodeApiV1Contract, urlStackNodeApiV1Tx} from "../network-config";

// export const getTxsAddressByPagination =  (address:string, limit:number, offset:number) => {
//   let finalUrl = urlStackNodeApiV1Adress +'/'+ address+ '/transactions?limit='+ limit +'&offset=' + offset
//   return fetch(finalUrl, {
//     method: 'GET', 
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   })
// }


// export const getTxsAddressContractByPagination = (limit:number, offset:number) => {
//     let finalUrl = urlStackNodeApiV1Contract + '/transactions?limit='+ limit +'&offset=' + offset
//     return fetch(finalUrl, {
//       method: 'GET', 
//       headers: {
//         'Content-Type': 'application/json'
//       },
//     })
//   }

// export const getTxsMempoolForAddress = async (address:string) => {
//   let finalUrl = urlStackNodeApiV1Tx + '/mempool?address='+ address
//   const response = await fetch(finalUrl, {
//     method: 'GET', 
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   })
  
//   const txsInfo = await response.json();
//   return txsInfo;
// }


// export const getTxsContractTemp = async () => {
//   let finalUrl = urlStackNodeApiV1Contract + '/transactions?limit=1'
//   const response = await fetch(finalUrl, {
//     method: 'GET', 
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   })
//   const txsInfo = await response.json();
//   return txsInfo;
// }

// export const getTxsAddressTemp = async (address:string) => {
//   let finalUrl = urlStackNodeApiV1Adress +'/'+ address+ '/transactions?limit=1'
//   const response = await fetch(finalUrl, {
//     method: 'GET', 
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   })
//   const txsInfo = await response.json();
//   return txsInfo;
// }

export const getAllTxsAddressContract = async () => {
  let finalUrl = 'https://testnet.aeternity.io/mdw/v2/txs?direction=forward&contract=ct_2MfLrBTRrbi8cgbqGp8HvVMG7SozQGoKBNiLGDm9R4ucnKZTDL&limit=50'
  const response = await fetch(finalUrl, {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const txsInfo = await response.json();
  return txsInfo;
}
//