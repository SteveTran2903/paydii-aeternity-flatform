import type { ReactElement } from 'react'
import LayoutDashboard from '../components/LayoutDashboard'
import type { NextPageWithLayout } from './_app'
import { useEffect, useState } from "react";

import { useAeternity } from "../providers/AeternityProvider";
import {fullContractOwnerAddressName } from '../network-config';
// import {  hexToCV , ClarityType } from '@stacks/transactions';

import PurchasedProducts from '../components/dashboardComponents/PurchasedProducts';
import ReviewsProducts from '../components/dashboardComponents/ReviewsProducts';
import LoadingData from '../components/LoadingData';

// import { getTxsAddressByPagination,getTxsContractTemp,getTxsAddressContractByPagination,getTxsAddressTemp} from '../api/transaction';
import { any } from 'prop-types';

const Page: NextPageWithLayout = () => {


  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  const [listProductIDs, setListProductIDs] = useState([]);
  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [listReviewerIdAndProductID, setListReviewerIdAndProductID ] = useState([])
  const [listDataReview, setListDataReview] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [totalTxsAddress, setTotalTxsAddress] = useState([])
  const [totalTxsContract, setTotalTxsContract] = useState([])

  const [listIdProductPurchased, setListIdProductPurchased] = useState([])


  useEffect(() => {
    if(dataUserSession.address) {
      setLoadingData(false)
      // getTxsContractTemp().then(txsInfo => {
      //   let totalItem:number = txsInfo['total']
      //   execPromiseContract(getListPromiseOfAllTxsContract(totalItem))
      // })
    }
  },[dataUserSession.address])

  // const execPromiseContract = (listPromise:any) => {
  //   if(listPromise.length > 0) {
  //     Promise.all(listPromise).then(responses => {
  //       let listOfPromiseResponse:any = []
  //       responses.forEach((respone) =>{
  //         listOfPromiseResponse.push(respone.json())
  //       })
        
  //       Promise.all(listOfPromiseResponse).then(values => {
  //         let totalTxOfContract:any[] = []
  //         values.forEach((itemFinal:any) => {
  //           totalTxOfContract = [...totalTxOfContract, ...itemFinal.results]
  //         })
  //         let temp = toObject(totalTxOfContract)
  //         // Have total tx of contract
  //         totalTxsContract = totalTxOfContract
  //         setTotalTxsContract(temp)
  //         console.log('totalTxOfContract', totalTxsContract)
  //         getTxsOfAddress()
  //       });

  //     });
  //   } 
  // }

  // const getTxsOfAddress = () => {
  //   getTxsAddressTemp(dataUserSession.address).then(txsInfo => {
  //     let totalItem:number = txsInfo['total']
  //     execPromiseAddress(getListPromiseOfAllTxsAdress(dataUserSession.address, totalItem))
  //   })
  // }

  // const getAllReviewByBuyer = (allTxAddress:any) => {
  //   let listReviewByBuyer = formatDataTxsToReviewByBuyer(allTxAddress)

  //  let listDataReviewFinal:any[] = []

  //   templateListProduct.forEach((itemProduct:any, index:number) => {
  //     listReviewByBuyer.forEach((itemReview: any, indexReview:number)=>{
  //       if(itemProduct['id'] == itemReview['product-id']) {
  //         let obj =  {
  //           productID: itemProduct['id'],
  //           productName: itemProduct['name'],
  //           image: itemProduct['img'],
  //           content: itemReview['content'],
  //           star: itemReview['star']
  //         }
  //         listDataReviewFinal.push(obj)
  //       }
  //     })
  //   })

  //   console.log('listDataReviewFinal', listDataReviewFinal)
  //   listDataReview = listDataReviewFinal
  //   let temp = toObject(listDataReviewFinal)
  //   setListDataReview(temp)

  // }

  // const execPromiseAddress = (listPromise:any) => {
  //   if(listPromise.length > 0) {
  //     Promise.all(listPromise).then(responses => {
  //       let listOfPromiseResponse:any = []
  //       responses.forEach((respone) =>{
  //         listOfPromiseResponse.push(respone.json())
  //       })
        
  //       Promise.all(listOfPromiseResponse).then(values => {
  //         let totalTxOfAddress:any[] = []
  //         values.forEach((itemFinal:any) => {
  //           totalTxOfAddress = [...totalTxOfAddress, ...itemFinal.results]
  //         })
  //         // have total tx of adress
  //         console.log('total txs of address', totalTxOfAddress);

  //         totalTxsAddress = totalTxOfAddress
  //         let obj = toObject(totalTxOfAddress)

  //         setTotalTxsAddress(obj)

  //         // Get list id product purchased
  //         let listIdProduct:any[] = formatDataTxsToListIdOfProductPurcharsed(totalTxOfAddress)

          

  //         listIdProductPurchased = listIdProduct
  //         let temp = toObject(listIdProduct)
  //         setListIdProductPurchased(temp)

  //         console.log('listIdProduct purchase', listIdProduct);
  //         executeGetDataProductFinal(temp)
  //         getAllReviewByBuyer(totalTxOfAddress)
          
  //       });

  //     });
  //   }
  // }

  // const executeGetDataProductFinal = (listIdProduct: any) => {
    
  //   let listProductCreatedTxs = filterTxsToForProductCreated(totalTxsContract)
  //   let listProductUpdatedTxs = filterTxsToForProductUpdated(totalTxsContract)

  //   console.log('listProductCreatedTxs', listProductCreatedTxs)
  //   console.log('listProductUpdatedTxs', listProductUpdatedTxs)

   
  //   let listDataProductUpdate:any[] = []
  //   let listDataProductLatestFinal:any[] = []

  //   listProductUpdatedTxs.forEach((itemUpdate: any, indexUpdate:any) => {
  //     let hexToCVProductID = hexToCV(itemUpdate['contract_call']['function_args'][0]['hex']) 
  //     let obj = {
  //       id: hexToCVProductID['data'],
  //       timeExec: itemUpdate['parent_burn_block_time_iso'],
  //       data : itemUpdate['contract_call']['function_args']
  //     }
  //     let { listProductClone, haveDuplicate } = checkDuplicateUpdateProduct(listDataProductUpdate, obj)
  //     if(haveDuplicate) {
  //       listDataProductUpdate = listProductClone
  //     } else {
  //       listDataProductUpdate.push(obj)
  //     }
  //   }) // Finaly we have a list data product update with latest update
     

  //   listProductCreatedTxs.forEach((itemCreate: any, indexUpdate:any) => {
  //     let hexToCVProductID = hexToCV(itemCreate['contract_call']['function_args'][0]['hex']) 
  //     let obj = {
  //       id: hexToCVProductID['data'],
  //       timeExec: itemCreate['parent_burn_block_time_iso'],
  //       data : itemCreate['contract_call']['function_args']
  //     }
      
  //     let {haveDuplicate, objLatest} = checkDuplicateDataProduct(listDataProductUpdate, obj)
      
  //     if(haveDuplicate) {
  //       listDataProductLatestFinal.push(objLatest)
  //     } else {
  //       listDataProductLatestFinal.push(obj)
  //     }
  //   })

  //   console.log('listDataProductLatestFinal', listDataProductLatestFinal)

  //   let listDataProductFormatFinal:any[] = []
  //   listDataProductLatestFinal.forEach((itemFinal:any) => {
  //     let objProduct = formartProductData(itemFinal['data'])
  //     listDataProductFormatFinal.push(objProduct)
  //   })

  //   templateListProduct = listDataProductFormatFinal
  //   let temp = toObject(listDataProductFormatFinal)
  //   setTemplateListProduct(temp)
  //   setLoadingData(false)
  // }

  // const checkDuplicateDataProduct = (listProduct: any, itemCheck:any) => {
  //   let haveDuplicate = false
  //   let objLatest = null
  //   for (var index = 0; index < listProduct.length; ++index) {
  //     if(listProduct[index].id == itemCheck.id) {
  //       haveDuplicate = true
  //       objLatest = listProduct[index]
  //       break;
  //     }
  //   }

  //   return {haveDuplicate,objLatest}
  // }

  // const checkDuplicateUpdateProduct = (listProduct: any, itemCheck:any) => {
  //   let listProductClone = listProduct
  //   let haveDuplicate = false

  //   for (var index = 0; index < listProduct.length; ++index) {
  //     if(listProduct[index].id == itemCheck.id) {
  //       let timeProduct = new Date(listProduct[index].timeExec)
  //       let timeCheck = new Date(itemCheck)
  //       haveDuplicate = true

  //       if(timeCheck > timeProduct) {
  //         // update new
  //         listProductClone[index] = itemCheck
  //         break;
  //       }
  //     }
  //   }

  //   return {listProductClone, haveDuplicate}
  // }

  // const checkIdProductInListId = (hex:string) => {
  //   let hexToCVData = hexToCV(hex)
  //   let res = false
  //   if(hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
  //     let id = hexToCVData['data']
  //     listIdProductPurchased.forEach((item:any) => {
  //       if(item['product-id'] == id) {
  //         res = true
  //       }
  //     })

  //   }
  //   return res
  // }

  // const filterTxsToForProductCreated = (listTxs:any) => {
  //   let listTxsProductCreated:any[] = []

  //   listTxs.forEach((item:any, index:number) => {
  //     if(item['tx_type'] == "contract_call") {
  //       if(item['contract_call']['function_name'] == 'create-product' && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
  //         if(item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {
            
  //           listTxsProductCreated.push(item)
  //         }
  //       }
  //     }
  //   })
  //   return listTxsProductCreated
  // }

  // const filterTxsToForProductUpdated = (listTxs:any) => {
  //   let listTxsProductUpdated:any[] = []

  //   listTxs.forEach((item:any, index:number) => {
  //     if(item['tx_type'] == "contract_call") {
  //       if(item['contract_call']['function_name'] == 'update-product' 
  //       && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
  //         if(item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {
  //           listTxsProductUpdated.push(item)
  //         }
  //       }
  //     }
  //   })
  //   return listTxsProductUpdated
  // }

  // const getListPromiseOfAllTxsAdress = (address:string, total:number) => {
  //   let listPromise = []
  //   let limit = 50 // max is 50
  //   let offset = 0
  //   listPromise.push(getTxsAddressByPagination(address, limit, offset))

  //   while(total > offset) {
  //     offset += limit
  //     listPromise.push(getTxsAddressByPagination(address, limit, offset))
  //     if(offset + limit > total) {
  //       break;
  //     }
  //   }

  //   return listPromise
  // }

  // const getListPromiseOfAllTxsContract = (total:number) => {
  //   let listPromise = []
  //   let limit = 50 // max is 50
  //   let offset = 0
  //   listPromise.push(getTxsAddressContractByPagination(limit, offset))

  //   while(total > offset) {
  //     offset += limit
  //     listPromise.push(getTxsAddressContractByPagination(limit, offset))
  //     if(offset + limit > total) {
  //       break;
  //     }
  //   }

  //   return listPromise
  // }
  
  // const formatDataTxsToListIdOfProductPurcharsed = (listTxs:any) => {
  //   let productPurchasedListId:any[] = []

  //   listTxs.forEach((item:any, index:number) => {
  //     if(item['tx_type'] == "contract_call") {
  //       if( (item['contract_call']['function_name'] == 'buy-product' || item['contract_call']['function_name'] == 'buy-product-with-coupon' )
  //       && item['contract_call']['contract_id'] == fullContractOwnerAddressName
  //       && item['sender_address'] == dataUserSession.address) {
  //         if(item['tx_status'] == 'success') {
  //           let objProduct = formartProductData(item['contract_call']['function_args'],)
  //           productPurchasedListId.push(objProduct)
  //         }
  //       }
  //     }
  //   })

  //   console.log('productPurchasedList', productPurchasedListId)

  //   return productPurchasedListId
  // }

  // const formartProductData = (dataProd:any) => {
  //   let res:any = {}
  //   dataProd.forEach((item:any) => {
  //     let hexToCVData = hexToCV(item['hex'])
      
  //     if(hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
  //       res[item['name']] = hexToCVData['data']
  //     }
  //     if(hexToCVData['type'] == ClarityType.UInt) {
  //       res[item['name']] = Number(hexToCVData['value'])/1000000
  //     }
  //     if(hexToCVData['type'] == ClarityType.BoolTrue) {
  //       res[item['name']] = true
  //     }
  //     if(hexToCVData['type'] == ClarityType.BoolFalse) {
  //       res[item['name']] = false
  //     }
  //   })

  //   res['urlBuy'] =  '/detail-product/' + res['id']
  //   // res['txIdCreate'] = txID
  //   return res
  // }

  // const formartDataReview = (dataProd:any) => {
  //   let res:any = {}
  //   dataProd.forEach((item:any) => {
  //     let hexToCVData = hexToCV(item['hex'])
      
  //     if(hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
  //       res[item['name']] = hexToCVData['data']
  //     }
  //     if(hexToCVData['type'] == ClarityType.UInt) {
  //       res[item['name']] = Number(hexToCVData['value'])
  //     }
  //     if(hexToCVData['type'] == ClarityType.BoolTrue) {
  //       res[item['name']] = true
  //     }
  //     if(hexToCVData['type'] == ClarityType.BoolFalse) {
  //       res[item['name']] = false
  //     }
  //   })
  //   return res
  // }

  // const formatDataTxsToReviewByBuyer = (listTxs:any) => {
  //   let addReviewList:any[] = []

  //   listTxs.forEach((item:any, index:number) => {
  //     if(item['tx_type'] == "contract_call") {
  //       if(item['contract_call']['function_name'] == 'add-review' 
  //       && item['contract_call']['contract_id'] == fullContractOwnerAddressName
  //       && item['sender_address'] == dataUserSession.address) {
  //         if(item['tx_status'] == 'success') {
  //           let objReview = formartDataReview(item['contract_call']['function_args'],)
  //           addReviewList.push(objReview)
  //         }
  //       }
  //     }
  //   })

  //   console.log('addReviewList', addReviewList)

  //   return addReviewList
  // }

  // const toObject = (data : object) => {
  //   return JSON.parse(JSON.stringify(data, (key, value) =>
  //       typeof value === 'bigint'
  //           ? value.toString()
  //           : value // return everything else unchanged
  //   ));
  // }

  return (
    <div className="row">
          <div className="col-sm-12">
            <div className="home-tab">
              <div className="d-sm-flex align-items-center justify-content-between border-bottom">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active ps-0" id="home-tab" data-bs-toggle="tab" href="#purchased" role="tab" aria-controls="purchased" aria-selected="true">Purchased</a>
                  </li>
                  
                  <li className="nav-item">
                    <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#reviews" role="tab" aria-selected="false">Your Review</a>
                  </li>
                </ul>
              </div>

              <div className="tab-content tab-content-basic">
                <div className="tab-pane fade show active" id="purchased" role="tabpanel" aria-labelledby="purchased">
                    <LoadingData loading={loadingData}></LoadingData>
                    <PurchasedProducts templateListProduct={templateListProduct}></PurchasedProducts>
                </div>
                <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews">
                    <ReviewsProducts templateListReview={listDataReview}></ReviewsProducts>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutDashboard>
      {page}
    </LayoutDashboard>
  )
}

export default Page