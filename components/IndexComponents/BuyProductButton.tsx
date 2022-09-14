// import { currentNetwork, contractOwnerAddress, contractName} from '../../network-config'
// import { ContractCallRegularOptions, openContractCall } from "@stacks/connect";
// import { appDetails} from "../../lib/constants";
// import { uintCV,StringAsciiCV, stringAsciiCV, cvToHex, hexToCV, ClarityType,
//           makeStandardSTXPostCondition,
//           makeContractSTXPostCondition,
//           FungibleConditionCode} from "@stacks/transactions";

// import {contractsApi} from '../../api/config'
import { useEffect, useState } from "react";

// import {
//     ReadOnlyFunctionSuccessResponse,
//   } from '@stacks/blockchain-api-client';

// import { useTransactionToasts } from "../../providers/TransactionToastProvider";
import truncateMiddle from "../../lib/truncate";
import Swal from 'sweetalert2'
import { useAeternity } from "../../providers/AeternityProvider";

export default function BuyProductButton(props: any) {


  const dataUserSession = useAeternity()

  console.log('Props button buy product', props)
  const idProduct = props.id
  const addressBuyer = props.address
  const priceProduct = props.price
  const seller = props.seller

  const [couponCode, setCouponCode] = useState<string>('');
  const [validCoupon, setValidCoupon] = useState<boolean>(false);
  const [validTextCoupon, setValidTextCoupon] = useState<boolean>(true);
  const [dataCouponCode, setDataCouponCode] = useState<any>();
  const [discountAmountValue, setDiscountAmountValue] = useState<number>(0);
  const [isDiscountPercent, setIsDiscountPercent] = useState<boolean>(false);

  const [disableBuyButton, setDisableBuyButton] = useState(false)

  // const { addTransactionToast } = useTransactionToasts()

  useEffect(() => {
    if (couponCode != '') {
      const timeOutId = setTimeout(() => {
        // Call check coupon function
        getCouponDetail(couponCode)
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [couponCode]);

  const buyProductHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log(`Buy product with ${idProduct} `)
    if (validCoupon) {
      // buyProductWithCoupon()
    } else {
      buyProduct()
    }
  }

  //   const writeProductIdAndTxIdToJsonFile = async (address:string|undefined,txId:string, type:string) => {
  //     let obj = {
  //         tx: txId,
  //         address: address,
  //         type: type,
  //     }
  //     const response = await fetch('/api/transaction', {
  //         method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify(obj) // body data type must match "Content-Type" header
  //       });
  //     console.log(response)

  //     // return response.json(); // parses JSON response into native JavaScript objects
  // }

    const buyProduct = async () => {

      console.log("buyProduct")

      let buyProduct = await dataUserSession.contractInstance.methods.buy_product(idProduct,false, '', {amount : priceProduct*(10**18)})

      console.log(buyProduct)

      // let tx = await this.contractInstance.transfer('ak_qTraJXXjNMG3or2pNsN6rgemqm9Sjpie68xuUjnwnNS8Vih1s', 1000000000000000000 , {amount : 1000000000000000000})



      // const network = new currentNetwork()

      // const priceProductConverted =  uintCV(priceProduct)

      // const numberStxWillSendToSeller = priceProductConverted.value - (uintCV(basisPoint).value * priceProductConverted.value)/ uintCV(10000).value

      // console.log(priceProductConverted.value, numberStxWillSendToSeller)

      // const standardStxPostCondition = makeStandardSTXPostCondition(
      //   addressBuyer,
      //   FungibleConditionCode.Equal,
      //   priceProductConverted.value
      // )

      // const contractStxPostCondition = makeContractSTXPostCondition(
      //   contractOwnerAddress,
      //   contractName,
      //   FungibleConditionCode.Equal,
      //   numberStxWillSendToSeller,
      // )

      // // (contract-call? .paydii create-product name img price isactive)
      // const options: ContractCallRegularOptions = {
      //   contractAddress: contractOwnerAddress,
      //   contractName: contractName,
      //   functionName: 'buy-product',
      //   functionArgs:  [
      //     stringAsciiCV(idProduct)
      //   ],
      //   postConditions: [standardStxPostCondition,contractStxPostCondition],
      //   network,
      //   appDetails,
      //   onFinish: ({ txId }) => {
      //     writeProductIdAndTxIdToJsonFile(addressBuyer, txId, 'buy-product')
      //     addTransactionToast(txId, `Buy Product ${idProduct} to ${truncateMiddle(contractOwnerAddress)}...`)
      //     Swal.fire({
      //       icon: 'success',
      //       title: 'Buying products on blockchain, please wait a moment!',
      //       text: 'Estimated completion time: 3 to 5 minutes or maybe sooner',
      //       showConfirmButton: true
      //     }).then((result) => {
      //       // router.push('/seller/catalog/products')
      //     })

      //   },
      // }
      // await openContractCall(options)
    }

  //   const buyProductWithCoupon = async () => {

  //     const network = new currentNetwork()

  //     const priceProductConverted =  uintCV(priceProduct)

  //     let amountDiscountFinal:any = null
  //     if(isDiscountPercent) {
  //       amountDiscountFinal = (uintCV(discountAmountValue).value * priceProductConverted.value)/ uintCV(10000).value
  //     } else {
  //       amountDiscountFinal = uintCV(discountAmountValue).value
  //     } 

  //     let newPriceAfterDiscount = priceProductConverted.value - amountDiscountFinal

  //     if(newPriceAfterDiscount <0) {
  //       newPriceAfterDiscount = uintCV(0).value
  //     }

  //     const numberStxWillSendToSeller = newPriceAfterDiscount - (uintCV(basisPoint).value * newPriceAfterDiscount)/ uintCV(10000).value

  //     console.log(newPriceAfterDiscount, numberStxWillSendToSeller)

  //     const standardStxPostCondition = makeStandardSTXPostCondition(
  //       addressBuyer,
  //       FungibleConditionCode.Equal,
  //       newPriceAfterDiscount
  //     )

  //     const contractStxPostCondition = makeContractSTXPostCondition(
  //       contractOwnerAddress,
  //       contractName,
  //       FungibleConditionCode.Equal,
  //       numberStxWillSendToSeller,
  //     )

  //     // (contract-call? .paydii create-product name img price isactive)
  //     const options: ContractCallRegularOptions = {
  //       contractAddress: contractOwnerAddress,
  //       contractName: contractName,
  //       functionName: 'buy-product-with-coupon',
  //       functionArgs:  [
  //         stringAsciiCV(idProduct),
  //         stringAsciiCV(couponCode)
  //       ],
  //       postConditions: [standardStxPostCondition,contractStxPostCondition],
  //       network,
  //       appDetails,
  //       onFinish: ({ txId }) => {
  //         console.log('buy product success',txId)
  //         addTransactionToast(txId, `Buy Product ${idProduct} to ${truncateMiddle(contractOwnerAddress)}...`)
  //         // alert('you buy this product successfully')
  //       },
  //     }
  //     await openContractCall(options)
  //   }

  const renderTextValidCoupon = () => {

    if (couponCode == '') {
      return (<></>)
    }
    else {
      if (!validCoupon) {
        return (<div className="coupon-alert-text">Coupon is not valid </div>)
      }
      else {
        let formatPrice = priceProduct / 10**18
        let discountAmountValueFormat = discountAmountValue / 10**18
        let newPriceTypeAmount = formatPrice - discountAmountValueFormat

        console.log('discount amount value', newPriceTypeAmount)
        if (newPriceTypeAmount <= 0) {
          return (
            <div className="coupon-success-text mt-2">
              <div>
                Your Coupon is {discountAmountValueFormat} STX off
              </div>
              <div className='text-danger'>
                Please contact the seller to get this product for free!
              </div>
            </div>
          )
        } else {
          return (
            <div className="coupon-success-text mt-2">
              <div>
                Your Coupon is {discountAmountValueFormat} STX off
              </div>
              <div>
                The current price of the product is <span className="new-price-discount">{newPriceTypeAmount} STX</span>
              </div>
            </div>
          )
        }
      }
    }
  }

  const initDataDiscout = (data: any) => {
    let dataCoupon = data

    let discountAmount = Number(dataCoupon.discount_amount)
    setDiscountAmountValue(discountAmount)
    setIsDiscountPercent(false)

    let formatPrice = priceProduct / 10**18
    let discountAmountValueFormat = discountAmount /  10**18
    let newPriceTypeAmount = formatPrice - discountAmountValueFormat
    

    if (newPriceTypeAmount <= 0) {
      setDisableBuyButton(true)
    } else {
      setDisableBuyButton(false)
    }
  }

  const getCouponDetail = async (couponId: any) => {

    try {

      let dataCouponDetail = await dataUserSession.contractInstance.methods.get_coupon_details(idProduct, couponId, seller)
      console.log('dataCouponDetail', dataCouponDetail)

      if (dataCouponDetail && dataCouponDetail.decodedResult) {
        dataCouponCode = dataCouponDetail.decodedResult
        let copy = Object.assign({}, dataCouponDetail.decodedResult)
        setDataCouponCode(copy)

        if (Number(dataCouponDetail.decodedResult.allowed_uses) > 0) {
          setValidTextCoupon(true)
          setValidCoupon(true)
          initDataDiscout(dataCouponDetail.decodedResult)
        } else {
          setValidCoupon(false)
          setValidTextCoupon(false)
          setDisableBuyButton(false)
        }
      }

    } catch (error) {
      setValidCoupon(false)
      setValidTextCoupon(false)
      setDisableBuyButton(false)
    }
  }

  return (

    <div className="card buy-product-wrapper border-0 mb-4 p-4">

      <div className="mb-4">
        <input
          type="text"
          id="coupon-code"
          onChange={(e) => setCouponCode(e.target.value)}
          className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter coupon code"
        />

        {renderTextValidCoupon()}
      </div>

      <button className="btn btn-sm btn-info m-auto" disabled={disableBuyButton} onClick={buyProductHandler}>
        <i className="mdi mdi-cart m-auto" />
        Buy Product Now
      </button>

    </div>
  )
}
