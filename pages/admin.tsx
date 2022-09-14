import type { ReactElement } from 'react'
import { ContractCallRegularOptions, openContractCall, UserData } from "@stacks/connect";
import {currentNetwork, contractOwnerAddress, contractName} from '../network-config'
import {  uintCV, stringAsciiCV, trueCV, falseCV ,
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  STXPostCondition,
  stringUtf8CV} from "@stacks/transactions";

import { useState } from "react";
import ActionButton from "../components/ActionButton";
import Auth from "../components/Auth";
import NumberInput from "../components/NumberInput";
import PageHeading from "../components/PageHeading";
import { appDetails } from "../lib/constants";
import truncateMiddle from "../lib/truncate";
import { useTransactionToasts } from "../providers/TransactionToastProvider";
import LayoutAdmin from '../components/LayoutAdmin'
import type { NextPageWithLayout } from './_app'


const Page: NextPageWithLayout = () => {
 // const [exchangeToken, setExchangeToken] = useState<string>('');


  /// For buy product
  const [idBuyProduct, setIdBuyProduct] = useState<string>('')
  ///

  const [idProduct, setIdProduct] = useState<string>('');
  const [nameProduct, setNameProduct] = useState<string>('');
  const [desProduct, setDesProduct] = useState<string>('');
  const [imgProduct, setImgProduct] = useState<string>('');
  const [priceAmount, setPriceAmount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const { addTransactionToast } = useTransactionToasts()


  const createProduct = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log(`Create product ${nameProduct} have price ${priceAmount}`)

    const network = new currentNetwork()

    // (contract-call? .paydii create-product name img price isactive)

    let data;

    if (isActive) {
      data = [
        stringAsciiCV(idProduct),
        stringAsciiCV(nameProduct),
        stringUtf8CV(desProduct),
        stringAsciiCV(imgProduct),
        uintCV(priceAmount),
        trueCV()
      ]
    } else {
      data = [
        stringAsciiCV(idProduct),
        stringAsciiCV(nameProduct),
        stringUtf8CV(desProduct),
        stringAsciiCV(imgProduct),
        uintCV(priceAmount),
        falseCV()
      ]
    }

    const options: ContractCallRegularOptions = {
      contractAddress: contractOwnerAddress,
      contractName: contractName,
      functionName: 'create-product',
      functionArgs: data,
      network,
      appDetails,
      onFinish: ({ txId }) => addTransactionToast(txId, `Create Product ${nameProduct} to ${truncateMiddle(contractOwnerAddress)}...`),
    }

    await openContractCall(options)
  }

  const standardStxPostCondition = makeStandardSTXPostCondition(
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    FungibleConditionCode.Equal,
    1 * 1000000,
  )

  const contractStxPostCondition = makeContractSTXPostCondition(
    contractOwnerAddress,
    contractName,
    FungibleConditionCode.Equal,
    0.99 * 1000000,
  )


  const buyProduct = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log(`Buy product with ${idBuyProduct} `)

    const network = new currentNetwork()

    // (contract-call? .paydii create-product name img price isactive)


    const options: ContractCallRegularOptions = {
      contractAddress: contractOwnerAddress,
      contractName: contractName,
      functionName: 'buy-product',
      functionArgs:  [
        stringAsciiCV(idBuyProduct)
      ],
      postConditions: [standardStxPostCondition,contractStxPostCondition],
      network,
      appDetails,
      onFinish: ({ txId }) => addTransactionToast(txId, `Create Product ${nameProduct} to ${truncateMiddle(contractOwnerAddress)}...`),
    }

    await openContractCall(options)
  }


  
  return (
    <div className="flex flex-col items-stretch max-w-4xl gap-8 m-auto p-5">
      <PageHeading>Admin</PageHeading>

      <Auth />

      <div>
        <form className="flex flex-col gap-4">

          <div>
            Create Product
          </div>

          <div>
            <label htmlFor="id-product" className="block text-sm font-medium text-gray-700">
              Product ID
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="id-product"
                onChange={(e) => setIdProduct(e.target.value)}
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter id of product"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name-product" className="block text-sm font-medium text-gray-700">
              Product name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name-product"
                onChange={(e) => setNameProduct(e.target.value)}
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter name of product"
              />
            </div>
          </div>

          <div>
            <label htmlFor="des-product" className="block text-sm font-medium text-gray-700">
              Product Description
            </label>
            <div className="mt-1">
              <textarea
                id="des-product"
                onChange={(e) => setDesProduct(e.target.value)}
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter des of product"
              />
            </div>
          </div>

          <div>
            <label htmlFor="img-product" className="block text-sm font-medium text-gray-700">
              Product image
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="img-product"
                onChange={(e) => setImgProduct(e.target.value)}
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter link of image product"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price-amount" className="block text-sm font-medium text-gray-700">
              Price product
            </label>
            <div className="mt-1">
              <NumberInput
                name="price-amount"
                decimals={0}
                required={false}
                defaultValue={priceAmount}
                onChange={(e) => setPriceAmount(e.target.valueAsNumber)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="is-active" className="block text-sm font-medium text-gray-700">
              Status product
            </label>
            <div className="mt-1">
            <input
              type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="block p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter link of image product"
              >
              </input>
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <ActionButton
              type="button"
              disabled={!nameProduct}
              onClick={createProduct}
            >
              Create Product
            </ActionButton>
          </div>
        </form>
      </div>

      <hr></hr>

      <div>
        <form className="flex flex-col gap-4">

          <div>
            Buy Product
          </div>

          <div>
            <label htmlFor="id-product" className="block text-sm font-medium text-gray-700">
              Product Id
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="id-product"
                onChange={(e) => setIdBuyProduct(e.target.value)}
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Id of product"
              />
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <ActionButton
              type="button"
              disabled={!idBuyProduct}
              onClick={buyProduct}
            >
              Buy Product
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
    
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAdmin>
      {page}
    </LayoutAdmin>
  )
}

export default Page