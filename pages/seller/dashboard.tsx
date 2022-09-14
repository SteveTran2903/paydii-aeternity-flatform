import type { ReactElement } from 'react'
import { useEffect, useState } from "react";

import LayoutDashboard from '../../components/LayoutDashboard'
import RevenueStatisticComponent from '../../components/sellerDashboardComponents/RevenueStatisticComponent'
import TransactionStatisticComponent from '../../components/sellerDashboardComponents/TransactionStatisticComponent'
import type { NextPageWithLayout } from '../_app'
import { useStacks } from "../../providers/StacksProvider";
import { contractOwnerAddress, contractName } from '../../network-config';
import { uintCV, StringAsciiCV, stringAsciiCV, cvToHex, hexToCV, standardPrincipalCV , ClarityType } from '@stacks/transactions';
import { ReadOnlyFunctionSuccessResponse } from '@stacks/blockchain-api-client';
import {contractsApi} from '../../api/config';
import ProfitStatisticComponent from '../../components/sellerDashboardComponents/ProfitStatisticComponent';
import LoadingData from '../../components/LoadingData';


const Page: NextPageWithLayout = () => {

  const dataUserSession = useStacks()

  const [statisticType, setStatisticType] = useState<string>('revenue');
  const [listProductIDs, setListProductIDs] = useState([]);
  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [templateListBuyerOfProduct, setTemplateListBuyerOfProduct] = useState([]);
  const [templateListDataReceiptOfBuyer, setTemplateListDataReceiptOfBuyer] = useState([]);
  const [listRevenueSortByProductDataChart, setListRevenueSortByProductDataChart] = useState([]);
  const [listProfitSortByProductDataChart, setListProfitSortByProductDataChart] = useState([]);

  const [revenueSeller, setRevenueSeller] = useState<number>(0);
  const [profitSeller, setProfitSeller] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true)



  useEffect(() => {
    if(dataUserSession.address) {
      getListProducBySeller(dataUserSession.address)
    }
  },[dataUserSession.address])


  const getListProducBySeller = async (address: any) => {
      const principal: string = contractOwnerAddress

      const buyer = standardPrincipalCV(address);

      console.log('address: ', address)

      // call a read-only function

      const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-product-ids-by-seller',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(buyer)],
        },
      });

      if(fnCall.result !== undefined) {
        let dataListProduct:any = hexToCV(fnCall.result)
        console.log("dataListProduct" ,dataListProduct)
        if(dataListProduct.list.length > 0) {
          let dataIdListConverted = toObject(dataListProduct['list'])
          listProductIDs = dataIdListConverted
          // setListProductIDs(dataIdListConverted)
          getDataProductsByIDs(dataListProduct['list'])
          getDataBuyerByProductIDs(dataListProduct['list'])
        } else {
          setLoadingData(false)
        }
      } else {
        setLoadingData(false)
      }
  }

  const getDataBuyerByProductIDs = (dataIds:any) => {

    let listProductIds = dataIds.map((item:any)=> {return item.data})

    let listPromise:any = []

    listProductIds.forEach((item:any) => {
      listPromise.push(getBuyerByProductID(item))
    })

    if(listPromise.length > 0) {
      Promise.all(listPromise).then((values) => {
        values.forEach((item_value,index) => {
          let dataBuyer:any = hexToCV(item_value.result)

          if(dataBuyer['list'].length > 0) {
            dataBuyer['list'].forEach((item:any) => {
              let data:any = {
                id: listProductIDs[index]['data'],
                address: item
              }

              templateListBuyerOfProduct.push(data)
              let temp = toObject(templateListBuyerOfProduct)
              setTemplateListBuyerOfProduct(temp)
            })
          }
        })
        console.log('templateListBuyerOfProduct', templateListBuyerOfProduct)

        getDataReceiptByBuyerPrincipal(templateListBuyerOfProduct)


      });
    }
  }

  const getDataProductsByIDs = (dataIds:any) => {

    let listProductIds = dataIds.map((item:any)=> {return item.data})

    let listPromise:any = []

    listProductIds.forEach((item:any) => {
      listPromise.push(getProductByID(item))
    })
    if(listPromise.length > 0) {
      Promise.all(listPromise).then((values) => {
        values.forEach((item_value,index) => {
          let dataProduct:any = hexToCV(item_value.result)

          if(dataProduct['type'] == ClarityType.OptionalSome) {
            let dataFormat = dataProduct['value']['data']

            if(dataFormat['name'].data != 'NULLPRODUCT') {
              let data:any = {
                  id: listProductIDs[index]['data'],
                  urlBuy: '/detail-product/' + listProductIDs[index]['data'],
                  name: dataFormat['name'].data,
                  description: dataFormat['description'].data,
                  img: dataFormat['img'].data,
                  price: Number(dataFormat['price'].value),
                  seller: dataFormat['seller']['address'].hash160,
              }

              if(dataFormat['is-active'].type  === ClarityType.BoolTrue) {
                data['is-active'] = true
              }
              if(dataFormat['is-active'].type  === ClarityType.BoolFalse) {
                data['is-active'] = false
              }
              if(data['is-active']) {
                templateListProduct.push(data)
                let temp = toObject(templateListProduct)
                setTemplateListProduct(temp)
              }
            }
          }

        })
        console.log('templateListProduct', templateListProduct)
      });
    }
  }

  const getDataReceiptByBuyerPrincipal = (dataBuyer:any) => {

    if(dataBuyer.length > 0) {
      let listPromise:any[] = []

      dataBuyer.forEach((item:any) => {
        listPromise.push(getBuyerReceipt(item.address, item.id))
      })

      if(listPromise.length > 0) {
        Promise.all(listPromise).then((values) => {
          values.forEach((item_value,index) => {
            let dataReceiptBuyer:any = hexToCV(item_value.result)

            let data:any = {
                id: templateListBuyerOfProduct[index]['id'],
                address: templateListBuyerOfProduct[index]['address'],
                value: dataReceiptBuyer['value'],
                productName: getNameProductByID(templateListBuyerOfProduct[index]['id']),
                productImage: getImageProductByID(templateListBuyerOfProduct[index]['id']),
            }
            templateListDataReceiptOfBuyer.push(data)
            let temp = toObject(templateListDataReceiptOfBuyer)
            setTemplateListDataReceiptOfBuyer(temp)

          })
          console.log('templateListDataReceiptOfBuyer', templateListDataReceiptOfBuyer)
          initDataForStatistics(templateListDataReceiptOfBuyer)
        });
      }
    } else {
      setLoadingData(false)
    }
  }

  const getNameProductByID = (idprod: string) => {
    let res = ''
    templateListProduct.forEach((item:any) => {
      if(item['id'] == idprod) {
        res = item['name']
      }
    })
    return res
  }

  const getImageProductByID = (idprod: string) => {
    let res = ''
    templateListProduct.forEach((item:any) => {
      if(item['id'] == idprod) {
        res = item['img']
      }
    })
    return res
  }

  const initDataForStatistics = (listDataReceipt: any) => {

    let totalRevenue = uintCV(0).value
    let totalProfit = uintCV(0).value

    let listRevenueSortByProduct:any[] = []
    // temp obj: { idProduct, nameProduct,  revenue}
    let listProfitSortByProduct:any[] = []
    // temp obj: { idProduct, nameProduct,  profit}

    listDataReceipt.forEach((item:any, index:number) => {
        let revenue = item['value']['data']['origin-price'].value
        totalRevenue += revenue

        let duplicate = false
        listRevenueSortByProduct.forEach((itemRevenue: any, index:number) => {
          if(itemRevenue['idProduct'] == item['id']) {
            duplicate = true
            itemRevenue['revenue'] += item['value']['data']['origin-price'].value
          }
        })

        if(!duplicate) {
          let data = {
            idProduct: item['id'],
            nameProduct: getNameProductByID(item['id']),
            revenue: item['value']['data']['origin-price'].value
          }
          listRevenueSortByProduct.push(data)
        }


        let profit = item['value']['data']['profit-price'].value
        totalProfit += profit

        let duplicateProfit = false
        listProfitSortByProduct.forEach((itemProfit: any, index:number) => {
          if(itemProfit['idProduct'] == item['id']) {
            duplicateProfit = true
            itemProfit['profit'] += item['value']['data']['profit-price'].value
          }
        })

        if(!duplicateProfit) {
          let data = {
            idProduct: item['id'],
            nameProduct: getNameProductByID(item['id']),
            profit: item['value']['data']['profit-price'].value
          }
          listProfitSortByProduct.push(data)
        }


    })

    console.log('listRevenueSortByProduct', listRevenueSortByProduct)
    console.log('listProfitSortByProduct', listProfitSortByProduct)
    console.log('totalRevenue', totalRevenue)
    console.log('totalProfit', totalProfit)


    let data =  toObject(listRevenueSortByProduct)
    listRevenueSortByProductDataChart = data
    setListRevenueSortByProductDataChart(data)

    let dataProfit =  toObject(listProfitSortByProduct)
    listProfitSortByProductDataChart = dataProfit
    setListProfitSortByProductDataChart(dataProfit)

    setRevenueSeller(Number(totalRevenue)/1000000)
    setProfitSeller(Number(totalProfit)/1000000)

    setLoadingData(false)

  }

  const getProductByID = (id: string) => {
    if(id) {
      const principal: string = contractOwnerAddress;

      const productID: StringAsciiCV = stringAsciiCV(id);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-product-by-id',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(productID)],
        },
      })
    }
  }

  const getBuyerReceipt = (buyerPrincipal: any, productId: string) => {
    if(buyerPrincipal && productId) {
      const principal: string = contractOwnerAddress;

      const productID: StringAsciiCV = stringAsciiCV(productId);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-buyer-receipt',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(buyerPrincipal),cvToHex(productID)],
        },
      })
    }
  }

  const getBuyerByProductID = (id: string) => {
    if(id) {
      const principal: string = contractOwnerAddress;

      const productID: StringAsciiCV = stringAsciiCV(id);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-buyer-ids-by-product',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(productID)],
        },
      })
    }
  }

  const toObject = (data : object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
  }

  const renderContentStatistic = () => {
    if(statisticType == 'revenue') {
      return (
        <RevenueStatisticComponent data={listRevenueSortByProductDataChart}></RevenueStatisticComponent>
      )
    }
    if(statisticType == 'profit') {
      return (
        <ProfitStatisticComponent data={listProfitSortByProductDataChart}></ProfitStatisticComponent>
      )
    }
    if(statisticType == 'transaction') {
      return (
        <TransactionStatisticComponent dataTable={templateListDataReceiptOfBuyer}></TransactionStatisticComponent>
      )
    }
  }

  const renderTopStatistic = () => {
    return (
    <div className="row">
      <div className="col-sm-12">
        <div className="statistics-details d-flex align-items-center justify-content-between">

          <div className={statisticType == 'revenue' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('revenue')}>
            <p className="statistics-title">Revenue</p>
            <h3 className="rate-percentage"><span className='text-success'>{revenueSeller}</span>  STX</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div>

          <div className={statisticType == 'profit' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('profit')}>
            <p className="statistics-title">Profit</p>
            <h3 className="rate-percentage"><span className='text-success'>{profitSeller}</span> STX</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span>
            </p>
          </div>

          <div className={statisticType == 'transaction' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('transaction')}>
            <p className="statistics-title">Transactions</p>
            <h3 className="rate-percentage">{templateListDataReceiptOfBuyer.length}</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div>

         {/* <div className={statisticType == 'products' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('products')}>
            <p className="statistics-title">Products</p>
            <h3 className="rate-percentage">{templateListProduct.length}</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div>

          <div className={statisticType == 'coupons' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('coupons')}>
            <p className="statistics-title">Coupons</p>
            <h3 className="rate-percentage">2</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div> */}

          {/* <div className={statisticType == 'reviews' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('reviews')}>
            <p className="statistics-title">Reviews</p>
            <h3 className="rate-percentage">2</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div> */}

        </div>
      </div>
    </div>
    )
  }


  return (
    <div className="row">
          <div className="col-sm-12">
            <div className="home-tab">
              <div className="d-sm-flex align-items-center justify-content-between border-bottom">

                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active ps-0" id="home-tab" data-bs-toggle="tab" href="#overview" role="tab" aria-controls="overview" aria-selected="true">Overview</a>
                  </li>
                </ul>

              </div>
              <div className="tab-content tab-content-basic">
                <div className="tab-pane fade show active" style={{position: 'relative'}} id="overview" role="tabpanel" aria-labelledby="overview">

                  <LoadingData loading={loadingData}></LoadingData>

                 {renderTopStatistic()}

                 {renderContentStatistic()}
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
