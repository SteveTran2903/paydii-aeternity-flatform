import type { ReactElement } from 'react'
import LayoutDashboard from '../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../_app'
import { useEffect, useState } from "react";

import { useStacks } from "../../../providers/StacksProvider";
import { fullContractOwnerAddressName } from '../../../network-config';
import { hexToCV , ClarityType } from '@stacks/transactions';

import TableProducts from '../../../components/dashboardComponents/TableProducts';
import Link from 'next/link'
import LoadingData from '../../../components/LoadingData';
import { getTxsAddressByPagination, getTxsContractTemp,getTxsAddressContractByPagination,getTxsAddressTemp } from '../../../api/transaction';

const Page: NextPageWithLayout = () => {

  const dataUserSession = useStacks()
  console.log('data user session', dataUserSession)

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [loadingData, setLoadingData] = useState(true)

  const [totalTxsAddress, setTotalTxsAddress] = useState([])
  const [totalTxsContract, setTotalTxsContract] = useState([])

  const [listIdProductCreated, setListIdProductCreated] = useState([])

  useEffect(() => {
    if(dataUserSession.address) {
      getTxsContractTemp().then(txsInfo => {
        let totalItem:number = txsInfo['total']
        execPromiseContract(getListPromiseOfAllTxsContract(totalItem))
      })
    }
  },[dataUserSession.address])

  const execPromiseContract = (listPromise:any) => {
    if(listPromise.length > 0) {
      Promise.all(listPromise).then(responses => {
        let listOfPromiseResponse:any = []
        responses.forEach((respone) =>{
          listOfPromiseResponse.push(respone.json())
        })
        
        Promise.all(listOfPromiseResponse).then(values => {
          let totalTxOfContract:any[] = []
          values.forEach((itemFinal:any) => {
            totalTxOfContract = [...totalTxOfContract, ...itemFinal.results]
          })
          let temp = toObject(totalTxOfContract)
          // Have total tx of contract
          totalTxsContract = totalTxOfContract
          setTotalTxsContract(temp)
          console.log('totalTxOfContract', totalTxsContract)
          getTxsOfAddress()
        });

      });
    } 
  }

  const getTxsOfAddress = () => {
    getTxsAddressTemp(dataUserSession.address).then(txsInfo => {
      let totalItem:number = txsInfo['total']
      execPromiseAddress(getListPromiseOfAllTxsAdress(dataUserSession.address, totalItem))
    })
  }

  const getListPromiseOfAllTxsAdress = (address:string, total:number) => {
    let listPromise = []
    let limit = 50 // max is 50
    let offset = 0
    listPromise.push(getTxsAddressByPagination(address, limit, offset))

    while(total > offset) {
      offset += limit
      listPromise.push(getTxsAddressByPagination(address, limit, offset))
      if(offset + limit > total) {
        break;
      }
    }

    return listPromise
  }

  const getListPromiseOfAllTxsContract = (total:number) => {
    let listPromise = []
    let limit = 50 // max is 50
    let offset = 0
    listPromise.push(getTxsAddressContractByPagination(limit, offset))

    while(total > offset) {
      offset += limit
      listPromise.push(getTxsAddressContractByPagination(limit, offset))
      if(offset + limit > total) {
        break;
      }
    }

    return listPromise
  }

  const execPromiseAddress = (listPromise:any) => {
    if(listPromise.length > 0) {
      Promise.all(listPromise).then(responses => {
        let listOfPromiseResponse:any = []
        responses.forEach((respone) =>{
          listOfPromiseResponse.push(respone.json())
        })
        
        Promise.all(listOfPromiseResponse).then(values => {
          let totalTxOfAddress:any[] = []
          values.forEach((itemFinal:any) => {
            totalTxOfAddress = [...totalTxOfAddress, ...itemFinal.results]
          })
          // have total tx of adress
          console.log('total txs of address', totalTxOfAddress);
          setTotalTxsAddress([...totalTxsAddress, ...totalTxOfAddress])

          // Get list id product purchased
          let listIdProduct:any[] = formatDataTxsToListIdOfProductCreated(totalTxOfAddress)

          setListIdProductCreated([...listIdProductCreated, ...listIdProduct])

          listIdProductCreated = listIdProduct
          let temp = toObject(listIdProduct)
          setListIdProductCreated(temp)
          console.log('listIdProduct Created', listIdProduct);
          executeGetDataProductFinal()
          // getAllReviewByBuyer(totalTxOfAddress)
          
        });

      });
    }
  }

  const executeGetDataProductFinal = () => {
    
    let listProductCreatedTxs = filterTxsToForProductCreated(totalTxsContract)
    let listProductUpdatedTxs = filterTxsToForProductUpdated(totalTxsContract)

    console.log('listProductCreatedTxs', listProductCreatedTxs)
    console.log('listProductUpdatedTxs', listProductUpdatedTxs)

   
    let listDataProductUpdate:any[] = []
    let listDataProductLatestFinal:any[] = []

    listProductUpdatedTxs.forEach((itemUpdate: any, indexUpdate:any) => {
      let hexToCVProductID = hexToCV(itemUpdate['contract_call']['function_args'][0]['hex']) 
      let obj = {
        id: hexToCVProductID['data'],
        timeExec: itemUpdate['parent_burn_block_time_iso'],
        data : itemUpdate['contract_call']['function_args']
      }
      let { listProductClone, haveDuplicate } = checkDuplicateUpdateProduct(listDataProductUpdate, obj)
      if(haveDuplicate) {
        listDataProductUpdate = listProductClone
      } else {
        listDataProductUpdate.push(obj)
      }
    }) // Finaly we have a list data product update with latest update
     

    listProductCreatedTxs.forEach((itemCreate: any, indexUpdate:any) => {
      let hexToCVProductID = hexToCV(itemCreate['contract_call']['function_args'][0]['hex']) 
      let obj = {
        id: hexToCVProductID['data'],
        timeExec: itemCreate['parent_burn_block_time_iso'],
        data : itemCreate['contract_call']['function_args']
      }
      
      let {haveDuplicate, objLatest} = checkDuplicateDataProduct(listDataProductUpdate, obj)
      
      if(haveDuplicate) {
        listDataProductLatestFinal.push(objLatest)
      } else {
        listDataProductLatestFinal.push(obj)
      }
    })

    console.log('listDataProductLatestFinal', listDataProductLatestFinal)

    let listDataProductFormatFinal:any[] = []
    listDataProductLatestFinal.forEach((itemFinal:any) => {
      let objProduct = formartProductData(itemFinal['data'])
      listDataProductFormatFinal.push(objProduct)
    })

    templateListProduct = listDataProductFormatFinal
    let temp = toObject(listDataProductFormatFinal)
    setTemplateListProduct(temp)
    setLoadingData(false)
  }

  const filterTxsToForProductCreated = (listTxs:any) => {
    let listTxsProductCreated:any[] = []

    listTxs.forEach((item:any, index:number) => {
      if(item['tx_type'] == "contract_call") {
        if(item['contract_call']['function_name'] == 'create-product' && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
          if(item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {
            
            listTxsProductCreated.push(item)
          }
        }
      }
    })
    return listTxsProductCreated
  }

  const checkIdProductInListId = (hex:string) => {
    let hexToCVData = hexToCV(hex)
    let res = false
    if(hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
      let id = hexToCVData['data']
      listIdProductCreated.forEach((item:any) => {
        if(item.id == id) {
          res = true
        }
      })

    }
    return res
  }

  const filterTxsToForProductUpdated = (listTxs:any) => {
    let listTxsProductUpdated:any[] = []

    listTxs.forEach((item:any, index:number) => {
      if(item['tx_type'] == "contract_call") {
        if(item['contract_call']['function_name'] == 'update-product' 
        && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
          if(item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {
            listTxsProductUpdated.push(item)
          }
        }
      }
    })
    return listTxsProductUpdated
  }

  const checkDuplicateUpdateProduct = (listProduct: any, itemCheck:any) => {
    let listProductClone = listProduct
    let haveDuplicate = false

    for (var index = 0; index < listProduct.length; ++index) {
      if(listProduct[index].id == itemCheck.id) {
        let timeProduct = new Date(listProduct[index].timeExec)
        let timeCheck = new Date(itemCheck)
        haveDuplicate = true

        if(timeCheck > timeProduct) {
          // update new
          listProductClone[index] = itemCheck
          break;
        }
      }
    }

    return {listProductClone, haveDuplicate}
  }

  const checkDuplicateDataProduct = (listProduct: any, itemCheck:any) => {
    let haveDuplicate = false
    let objLatest = null
    for (var index = 0; index < listProduct.length; ++index) {
      if(listProduct[index].id == itemCheck.id) {
        haveDuplicate = true
        objLatest = listProduct[index]
        break;
      }
    }

    return {haveDuplicate,objLatest}
  }

  const formatDataTxsToListIdOfProductCreated = (listTxs:any) => {
    let productCreatedListId:any[] = []

    listTxs.forEach((item:any, index:number) => {
      if(item['tx_type'] == "contract_call") {
        if(item['contract_call']['function_name'] == 'create-product' 
        && item['contract_call']['contract_id'] == fullContractOwnerAddressName
        && item['sender_address'] == dataUserSession.address) {
          if(item['tx_status'] == 'success') {
            let objProduct = formartProductData(item['contract_call']['function_args'],)
            productCreatedListId.push(objProduct)
          }
        }
      }
    })

    console.log('productPurchasedList', productCreatedListId)

    return productCreatedListId
  }

  const formartProductData = (dataProd:any) => {
    let res:any = {}
    dataProd.forEach((item:any) => {
      let hexToCVData = hexToCV(item['hex'])
      
      if(hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
        res[item['name']] = hexToCVData['data']
      }
      if(hexToCVData['type'] == ClarityType.UInt) {
        res[item['name']] = Number(hexToCVData['value'])/1000000
      }
      if(hexToCVData['type'] == ClarityType.BoolTrue) {
        res[item['name']] = true
      }
      if(hexToCVData['type'] == ClarityType.BoolFalse) {
        res[item['name']] = false
      }
    })

    res['urlBuy'] =  '/detail-product/' + res['id']
    // res['txIdCreate'] = txID
    return res
  }

  const toObject = (data : object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
  }


  return (
    <div className="row">
      <div className="col-sm-12">
      <div className="row flex-grow">
      <div className="col-12 grid-margin stretch-card">
        <div className="card card-rounded">
          <div className="card-body">
            <div className="d-sm-flex justify-content-between align-items-start">
              <div>
                <h4 className="card-title card-title-dash">
                  Your Products
                </h4>
                <p className="card-subtitle card-subtitle-dash">
                  List all your products
                </p>
              </div>
              <div>
                <Link href={"/seller/catalog/product/new"}>
                  <button className="btn btn-success text-white mb-0 me-0" type="button">
                    <i className="mdi mdi mdi-plus" />
                    Add new product
                    </button>
                  </Link>
              </div>
            </div>
            <div className="table-responsive  mt-1" style={{position: 'relative'}}>
                <LoadingData loading={loadingData}></LoadingData>
                <TableProducts dataTable={templateListProduct} mode='standard'></TableProducts>
            </div>
          </div>
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