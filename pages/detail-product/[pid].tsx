import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from "react";
import { contractsApi } from '../../api/config'
import { StringAsciiCV, standardPrincipalCV, stringAsciiCV, uintCV, cvToHex, hexToCV, ClarityType, cvToJSON } from '@stacks/transactions';
import {
  ReadOnlyFunctionSuccessResponse,
} from '@stacks/blockchain-api-client';
import { contractOwnerAddress, contractName, currentNetwork } from '../../network-config';
import BuyProductButton from '../../components/IndexComponents/BuyProductButton';

import { useAeternity } from "../../providers/AeternityProvider";

import type { ReactElement } from 'react'
import LayoutIndex from '../../components/LayoutIndex'
import type { NextPageWithLayout } from '../_app'
import ReactStars from "react-star-rating-component";
import { useForm } from 'react-hook-form';
import { ContractCallRegularOptions, openContractCall, UserData } from "@stacks/connect";
import { appDetails } from "../../lib/constants"

import truncateMiddle from "../../lib/truncate";
import LoadingData from '../../components/LoadingData';


const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const [dataProductDetail, setDataProductDetail] = useState(null);
  const [basisPoint, setBasisPoint] = useState(0)
  const [ratingValue, setRatingValue] = useState(4)
  const [listReviewerIds, setListReviewerIds] = useState([])
  const [listDataReview, setListDataReview] = useState([])
  const [boughtProduct, setBoughtProduct] = useState(false)
  const [isOwnerProduct, setIsOwnerProduct] = useState(false)
  const [alreadyComment, setAlreadyComment] = useState(false)
  const [isPurchasedProduct, setIsPurchasedProduct] = useState(false)

  const { pid } = router.query
  console.log(pid)

  const { register, handleSubmit, setValue, watch, getValues, formState: { isValid, errors } } = useForm({ mode: 'onChange' });

  const dataUserSession = useAeternity()

  console.log('data user session', dataUserSession)


  useEffect(() => {
    if (pid) {
      // getProductByID(pid)
      // getReviewerIdsByProduct(pid)
      // getBuyerIdsByProduct(pid)
      // if(dataUserSession.address) {
      //   getBuyerReceipt(dataUserSession.address, pid)
      //   getListProducBySeller(dataUserSession.address)
      // }
    }
  }, [router.query, router.asPath])

  useEffect(() => {
    if (pid) {
      if (dataUserSession.address) {
        console.log('dataProductDetail',dataProductDetail)
        if (dataProductDetail && dataProductDetail.seller) {
          if (dataProductDetail.seller == dataUserSession.address) {
            setIsOwnerProduct(true)
          }
        }
        // getBuyerIdsByProduct(pid)
        // getBuyerReceipt(dataUserSession.address, pid)
        // getListProducBySeller(dataUserSession.address)
      }
    }
  }, [dataUserSession.address])

  useEffect(() => {
    if (pid) {
      if (dataUserSession.contractInstance) {
        getProductByID(pid)
        // getBuyerIdsByProduct(pid)
        // getBuyerReceipt(dataUserSession.address, pid)
        // getListProducBySeller(dataUserSession.address)
      }
    }
  }, [dataUserSession.contractInstance])


  const getProductByID = async (id: any) => {

    let dataProductById = await dataUserSession.contractInstance.methods.get_product(id)

    console.log('dataProductById', dataProductById)

    if (dataProductById && dataProductById.decodedResult) {

      setDataProductDetail(dataProductById.decodedResult)

      if (dataUserSession.address) {
        if (dataProductById.decodedResult.seller == dataUserSession.address) {
          setIsOwnerProduct(true)
        }
      }
    }
  }

  //   const getListProducBySeller = async (address: any) => {
  //     const principal: string = contractOwnerAddress

  //     const seller = standardPrincipalCV(address);

  //     console.log('address: ', address)

  //     // call a read-only function

  //     const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
  //       contractAddress: principal,
  //       contractName: contractName,
  //       functionName: 'get-product-ids-by-seller',
  //       readOnlyFunctionArgs: {
  //         sender: principal,
  //         arguments: [cvToHex(seller)],
  //       },
  //     });
  //     if(fnCall.result !== undefined) {
  //       let dataListProduct:any = hexToCV(fnCall.result)
  //       console.log("dataListProductBySeller" ,dataListProduct)
  //       if(dataListProduct['type'] == ClarityType.List) {
  //         let checkOwner = false
  //         dataListProduct['list'].forEach((item:any, index:number) => {
  //             if(item['data'] == pid) {
  //               checkOwner = true
  //             }
  //         })
  //         setIsOwnerProduct(checkOwner)
  //       }
  //     }
  //   }

  //   const getBasisPoint = async () => {
  //     const principal: string = contractOwnerAddress;

  //     // call a read-only function

  //     const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
  //       contractAddress: principal,
  //       contractName: contractName,
  //       functionName: 'get-fee-basis-points',
  //       readOnlyFunctionArgs: {
  //         sender: principal,
  //         arguments: [],
  //       },
  //     });
  //     if(fnCall.result !== undefined) {
  //       let dataBasisPoin:any = hexToCV(fnCall.result)

  //       if(dataBasisPoin.type == ClarityType.ResponseOk) {
  //         setBasisPoint(Number(dataBasisPoin.value.value))
  //       }

  //       console.log('dataBasisPoint', dataBasisPoin)
  //     }
  //   }


  //   const getBuyerIdsByProduct = async (productId:any) => {

  //     const principal: string = contractOwnerAddress

  //     const productID: StringAsciiCV = stringAsciiCV(productId);

  //     console.log(productID)

  //     const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
  //       contractAddress: principal,
  //       contractName: contractName,
  //       functionName: 'get-buyer-ids-by-product',
  //       readOnlyFunctionArgs: {
  //         sender: principal,
  //         arguments: [cvToHex(productID)],
  //       },
  //     });

  //     if(fnCall.result) {
  //       let dataBuyerIDs:any = hexToCV(fnCall.result)
  //       if(dataBuyerIDs.type == ClarityType.List && dataUserSession.address) {
  //         let dataBuyerIDsToJSON = cvToJSON(dataBuyerIDs)
  //         dataBuyerIDsToJSON['value'].forEach((item:any) => {
  //           if(item['value'] == dataUserSession.address) {
  //             // Pudcharsed
  //             setIsPurchasedProduct(true)
  //           }
  //         })
  //         console.log('dataBuyerIDsToJSON', dataBuyerIDsToJSON)
  //       }
  //     }

  //   }

  //   const getBuyerReceipt = async (addressBuyer: any, productID: any) => {
  //     const principal: string = contractOwnerAddress

  //     const buyer = standardPrincipalCV(addressBuyer);
  //     const prodID: StringAsciiCV = stringAsciiCV(productID);

  //     console.log('address: ', addressBuyer)

  //     // call a read-only function

  //     const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
  //       contractAddress: principal,
  //       contractName: contractName,
  //       functionName: 'get-buyer-receipt',
  //       readOnlyFunctionArgs: {
  //         sender: principal,
  //         arguments: [cvToHex(buyer), cvToHex(prodID) ],
  //       },
  //     });

  //     if(fnCall.result !== undefined) {
  //       let dataBuyerReceipt:any = hexToCV(fnCall.result)
  //       console.log('dataBuyerReceipt',dataBuyerReceipt)

  //       if(dataBuyerReceipt['type'] == ClarityType.OptionalSome) {
  //         // Bought
  //         setBoughtProduct(true)

  //       } else {
  //         // Haven't bought or can't buy
  //         setBoughtProduct(false)
  //       }
  //     }

  // }

  //   const getReviewerIdsByProduct = async (productId:any) => {
  //     const principal: string = contractOwnerAddress

  //     const productID: StringAsciiCV = stringAsciiCV(productId);

  //     const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
  //       contractAddress: principal,
  //       contractName: contractName,
  //       functionName: 'get-reviewer-ids-by-product',
  //       readOnlyFunctionArgs: {
  //         sender: principal,
  //         arguments: [cvToHex(productID)],
  //       },
  //     });
  //     if(fnCall.result !== undefined) {
  //       let dataIdsReviewer:any = hexToCV(fnCall.result)
  //         if(dataIdsReviewer['type'] == ClarityType.List) {
  //         console.log('dataIdsReview', dataIdsReviewer['list'])
  //         listReviewerIds = dataIdsReviewer['list']
  //         setListReviewerIds(toObject(dataIdsReviewer['list']))
  //         getListReviewByIdsReviewer(dataIdsReviewer['list'])
  //       }
  //     }
  //   }

  //   const getListReviewByIdsReviewer = (dataIds:any) => {

  //     let listPromise:any = []

  //     dataIds.forEach((item:any) => {
  //         listPromise.push(checkReviewExist(item))
  //     })

  //     if(listPromise.length > 0) {
  //         Promise.all(listPromise).then((values) => {

  //             let listDataReviewTemp:any = []

  //             values.forEach((item_value,index) => {
  //                 let dataReview:any = hexToCV(item_value.result)
  //                 console.log('dataReview' + index, dataReview)
  //                 if(dataReview['type'] == ClarityType.OptionalSome) {
  //                   let dataFormat = dataReview['value']['data']
  //                   let obj = {
  //                       address: cvToJSON(listReviewerIds[index]).value,
  //                       content: dataFormat['content']['data'],
  //                       star:  Number(dataFormat['star']['value'])
  //                   }
  //                   listDataReviewTemp.push(obj)
  //                 }
  //             })

  //             listDataReview = listDataReviewTemp
  //             console.log('listDataReview',listDataReview)

  //             let temp = toObject(listDataReviewTemp)
  //             setListDataReview(temp)


  //             if(dataUserSession.address) {
  //               let haveComment = false
  //               listDataReview.forEach((itemReview:any) => {
  //                   if(dataUserSession.address?.toLowerCase() == itemReview.address.toLowerCase()) {
  //                       haveComment = true
  //                   }
  //               })
  //               setAlreadyComment(haveComment)
  //             }

  //         });
  //     }
  //   }

  const checkReviewExist = (address: any) => {
    if (address['type'] == ClarityType.PrincipalStandard) {
      const principal: string = contractOwnerAddress;
      const productID: StringAsciiCV = stringAsciiCV(pid);

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'check-review-exist',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(productID), cvToHex(address)],
        },
      })
    }
  }

  const toObject = (data: object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  const handleButtonBuyNow = (id: string, price: number, seller: any) => {
    console.log(dataUserSession.address)

    if (isOwnerProduct) {
      return (
        <div className="card buy-product-wrapper border-0 mb-4 p-4">
          <div className="text-center">
            <h5>
              <span className='text-success'>You are the owner of this product</span>
              <Link href={'/seller/catalog/product/' + id}>
                <button className='btn btn-sm btn-info mt-2 d-flex align-items-center' style={{ margin: 'auto' }}>
                  <i className='mdi mdi-grease-pencil mr-2'></i>
                  Edit product
                </button>
              </Link>
            </h5>
          </div>
        </div>
      )
    }

    if (boughtProduct) {
      return (
        <div className="card buy-product-wrapper border-0 mb-4 p-4">
          <div className="mb-4 text-center">
            <div className='mt-2'>
              <h5 className='text-info'>You already bought this product</h5>
            </div>

            <div className='mt-4'>
              <Link href={'/dashboard/purchased/' + id}>
                <button className="btn btn-sm btn-success">
                  <i className="mdi mdi-cart m-auto" />
                  Go to Dashboard to view detail
                </button>
              </Link>
            </div>
          </div>
        </div>
      )
    } else {
      if (dataUserSession.address) {
        return (
          <BuyProductButton id={id} address={dataUserSession.address} price={price} seller={seller}></BuyProductButton>
        )
      }
      else {
        return (
          <div className="btn btn-info" onClick={dataUserSession.handleLogIn}>
            <i className="mdi mdi-cart m-auto" />
            Buy Now
          </div>
        )
      }
    }
  }

  const handleCreateReview = (dataForm: any) => {
    console.log("dataForm", dataForm)
    console.log('ratingValue', ratingValue)
    createReview(dataForm)
  }

  const writeProductIdAndTxIdToJsonFile = async (address: string | undefined, txId: string, type: string) => {
    let obj = {
      tx: txId,
      address: address,
      type: type,
    }
    const response = await fetch('/api/transaction', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj) // body data type must match "Content-Type" header
    });
    console.log(response)

    // return response.json(); // parses JSON response into native JavaScript objects
  }

  const createReview = async (dataCoupon: any) => {
    const network = new currentNetwork()

    let data;

    const productID: StringAsciiCV = stringAsciiCV(pid);

    data = [
      productID,
      stringAsciiCV(dataCoupon['commentReview']),
      uintCV(Number(ratingValue)),
    ]

    const options: ContractCallRegularOptions = {
      contractAddress: contractOwnerAddress,
      contractName: contractName,
      functionName: 'add-review',
      functionArgs: data,
      network,
      appDetails,
      onFinish: ({ txId }) => {
        writeProductIdAndTxIdToJsonFile(dataUserSession.address, txId, 'review-product')
        // addTransactionToast(txId, `Create review ${truncateMiddle(contractOwnerAddress)}...`)
      },
    }

    await openContractCall(options)
  }

  const ratingChanged = (newRating: any, prevRating: any, name: any) => {
    // console.log(newRating);
    setRatingValue(newRating)
  };

  const truncateString = (text: string, numberChars: number) => {
    if (text.length <= numberChars) {
      return text
    }

    if (text) {
      let res = text.slice(text.length - numberChars, text.length)
      return res
    }

    return ''
  }

  const renderNoData = () => {
    if (listDataReview.length == 0) {
      return (
        <h5 className='text-info'>This product don't have any review!</h5>
      )
    } else {
      return <></>
    }
  }

  const colorRandom = () => {
    let randomColor1 = Math.floor(Math.random() * 255);
    let randomColor2 = Math.floor(Math.random() * 255);
    let randomColor3 = Math.floor(Math.random() * 255);
    return 'rgb(' + randomColor1 + ',' + randomColor2 + ',' + randomColor3 + ')'
  }
  const renderListReview = () => {

    return (
      <div className='list-review mb-4'>
        <h4 className="mb-4">Reviews</h4>

        {renderNoData()}

        {listDataReview.map((item: any, index: number) => {
          return (
            <div className="media mb-4" key={index}>

              <div className='random-avatar' style={{ backgroundColor: colorRandom() }}>
                {truncateString(item.address, 3)}
              </div>

              <div className="media-body">
                <h6>{item.address}</h6>
                <div className="text-primary mb-2">
                  <ReactStars name={'rateprod' + index} editing={false} starCount={5} value={item.star} starColor={'#ffd700'}></ReactStars>
                </div>
                <p>{item.content}</p>
              </div>
            </div>
          )
        })}

      </div>
    )
  }

  const renderLeaveReview = () => {

    if (alreadyComment || isOwnerProduct) {
      if (alreadyComment) {
        return (
          <div className='already-comment-product'>
            You already added review for this product!
          </div>
        )
      }
    } else {
      if (dataUserSession.address && isPurchasedProduct) {
        return (
          <div className="comment-review">
            <h4 className="mb-4">Leave a review</h4>
            <div className="d-flex my-2 vote-star-wrapper" >
              <p className="mb-0 mr-2">Your Rating * :</p>
              <div className="text-primary">
                <ReactStars name='rateproduct' onStarClick={ratingChanged.bind(this)} starCount={5} value={ratingValue} starColor={'#ffd700'}></ReactStars>
              </div>
            </div>
            <form onSubmit={handleSubmit(handleCreateReview)}>
              <div className="form-group">
                <label htmlFor="message">Your Review *</label>
                <textarea {...register('commentReview', { required: true })} rows={5} className="form-control" />
                {errors?.commentReview?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
              </div>
              <div className="form-group mb-0">
                <button type="submit" className="btn btn-info px-3">Leave Your Review</button>
              </div>
            </form>
          </div>
        )
      } else {
        return <></>
      }

    }
  }

  if (dataProductDetail) {
    return (
      <div className="container-fluid py-5">
        <div className="row px-xl-5">

          <div className="col-lg-5 pb-5">
            <img className="w-100 img-detail-product" src={dataProductDetail['img']} alt="Image" />
          </div>

          <div className="col-lg-7 pb-5">
            <h3 className="font-weight-semi-bold">{dataProductDetail['name']}</h3>
            <div className="d-flex mb-3">
              <small className="pt-1">({listDataReview.length} Reviews)</small>
            </div>
            <div className="d-flex mb-3">
              <p className="font-weight-semi-bold">Adress Owner: {dataProductDetail['seller']}</p>
            </div>
            <h3 className="font-weight-semi-bold mb-4">
              {(Number(dataProductDetail['price'])).toFixed(4)}
              <span className='currency-product'> STX</span>
            </h3>

            <p className="mb-4">
              {dataProductDetail['description']}
            </p>

            <div className="d-flex align-items-center mb-4 pt-2">
              {handleButtonBuyNow(dataProductDetail['id'], Number(dataProductDetail['price']), dataProductDetail['seller'])}
            </div>
          </div>
        </div>
        <div className="row px-xl-5 pt-5">

          <div className="col-md-6">
            <div className="description-product">
              <h4 className="mb-3">Product Description</h4>
              {dataProductDetail['description']}
            </div>
          </div>

          <div className="col-md-6">
            {renderListReview()}
            {renderLeaveReview()}
          </div>

        </div>
      </div>
    )
  }
  else {
    return (
      <div>
        <LoadingData loading={true}></LoadingData>
      </div>
    )
  }
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutIndex>
      {page}
    </LayoutIndex>
  )
}

export default Page
