import type { ReactElement } from 'react'
import LayoutDashboard from '../../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { contractOwnerAddress, contractName, currentNetwork} from '../../../../network-config';
import { StringAsciiCV,stringUtf8CV,uintCV, trueCV,falseCV, stringAsciiCV, cvToHex, hexToCV, standardPrincipalCV , ClarityType } from '@stacks/transactions';
import { ReadOnlyFunctionSuccessResponse } from '@stacks/blockchain-api-client';
import {contractsApi} from '../../../../api/config';
import { useRouter } from 'next/router'
import { appDetails } from "../../../../lib/constants"
import { useTransactionToasts } from "../../../../providers/TransactionToastProvider";
import { ContractCallRegularOptions, openContractCall, UserData } from "@stacks/connect";
import truncateMiddle from "../../../../lib/truncate";
import { useStacks } from "../../../../providers/StacksProvider";
import Swal from 'sweetalert2'


const Page: NextPageWithLayout = () => {
    const dataUserSession = useStacks()

    const router = useRouter()
    const { register, handleSubmit, setValue, watch, getValues, formState: {isValid, errors} } = useForm({mode: 'onChange'});
    const { addTransactionToast } = useTransactionToasts()

    const watchIspercentage = watch("isPercentage", false);

    const [listProductIDs, setListProductIDs] = useState([]);
    const [templateListProduct, setTemplateListProduct] = useState([]);

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
            if(dataListProduct) {
            let dataIdListConverted = toObject(dataListProduct['list'])
            listProductIDs = dataIdListConverted
            // setListProductIDs(dataIdListConverted)
            getDataProductsByIDs(dataListProduct['list'])
            }
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

                    if(dataProduct['type'] = ClarityType.OptionalSome) {
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

                            templateListProduct.push(data)
                            console.log('templateListProduct',templateListProduct)

                            let temp = toObject(templateListProduct)
                            setTemplateListProduct(temp)
                            setValue('belongProduct', '')
                        }
                    }


                })

            });
        }
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

    const handleCreateCoupon = (dataForm:any) => {
        console.log("dataForm",dataForm)
        createCoupon(dataForm)
    }

    const writeProductIdAndTxIdToJsonFile = async (address:string|undefined,txId:string, type:string) => {
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
            body: JSON.stringify(obj)
          });
        console.log(response)
    }

    const createCoupon = async (dataCoupon:any) => {
        const network = new currentNetwork()

        let data;

        if (dataCoupon['isPercentage']) {
            data = [
                stringAsciiCV(dataCoupon['belongProduct']),
                stringAsciiCV(dataCoupon['codeCoupon']),
                uintCV(Number(dataCoupon['allowedUser'])),
                uintCV((Number(dataCoupon['percentValueCoupon'])* 10000)/100),
                trueCV()
            ]
        } else {
            data = [
                stringAsciiCV(dataCoupon['belongProduct']),
                stringAsciiCV(dataCoupon['codeCoupon']),
                uintCV(Number(dataCoupon['allowedUser'])),
                uintCV(Number(dataCoupon['amountValueCoupon'])* 1000000),
                falseCV()
            ]
        }

        const options: ContractCallRegularOptions = {
            contractAddress: contractOwnerAddress,
            contractName: contractName,
            functionName: 'create-coupon',
            functionArgs: data,
            network,
            appDetails,
            onFinish: ({ txId }) => {
                writeProductIdAndTxIdToJsonFile(dataUserSession.address,txId, 'create-coupon')
                addTransactionToast(txId, `Create Coupon ${dataCoupon['codeCoupon']} to ${truncateMiddle(contractOwnerAddress)}...`)
                Swal.fire({
                    icon: 'success',
                    title: 'Creating coupon on Stacks blockchain, please wait for a moment!',
                    text: 'Estimated completion time: 3 to 5 minutes or maybe sooner',
                    showConfirmButton: true
                  }).then((result) => {
                    router.push('/seller/catalog/coupons')
                  })
            },
        }

        await openContractCall(options)
    }

    const toObject = (data : object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    const renderValueCoupon = (isPercentage:boolean) => {

        if(isPercentage) {
            return (
                <div className="form-group mt-4">
                    <label>How much percentage of the coupon? (min: 0 - max: 100)</label>
                    <input step={1} type="number" {...register('percentValueCoupon', {max:100, min:0, required: true, valueAsNumber: true} )} min={0} max={100} className="form-control" placeholder="The number of percent you want to discount" />
                    {errors?.percentValueCoupon?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                    {errors?.percentValueCoupon?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                    {errors?.percentValueCoupon?.type === 'min' &&  <span className='text-error-form'>Min value is 0</span>}
                    {errors?.percentValueCoupon?.type === 'max' &&  <span className='text-error-form'>Max value is 100</span>}
                </div>
            )
        } else {
            return (
                <div className="form-group mt-4">
                    <label>Amount STX</label>
                    <input step='any' type="number" {...register('amountValueCoupon', { required: true, valueAsNumber: true} )} className="form-control" placeholder="Amount STX you want to discount" />
                    {errors?.amountValueCoupon?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                    {errors?.amountValueCoupon?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                </div>
            )
        }
    }
    const renderSelectBelongProduct = () => {

        templateListProduct.map((item:any) => {
            return (
                <option value={item['id']}>{item['name']}</option>
            )
        })


        return (
            <div className="form-group">
                <label>Applicable Product</label>
                <select {...register('belongProduct', { required: true } )} className="form-select" aria-label="This coupon is belong to this product">
                    <option value="" disabled selected>Select product</option>
                    {templateListProduct.map((item:any, key:number) => {
                        return (
                            <option key={key} value={item['id']}>{item['name']}</option>
                        )
                    })}
                </select>
                {errors?.belongProduct?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
            </div>
        )
    }


    return (
        <div className="row">
            <div className="col-md-10 grid-margin stretch-card">
                <div className="card">
                <div className="card-body">

                    <form className="forms-seller-product" onSubmit={handleSubmit(handleCreateCoupon)}>
                        <div className="form-group">
                            <label>Code</label>
                            <input {...register('codeCoupon', {required: true } )}  type="text" className="form-control" placeholder="Enter code of coupon"/>
                            {errors?.codeCoupon?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                        </div>

                        {renderSelectBelongProduct()}

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Allowed Uses</label>
                                    <input step={1} type="number" {...register('allowedUser', { required: true, valueAsNumber: true} )} min={0} className="form-control" placeholder="The number of uses of the coupon" />
                                    {errors?.allowedUser?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                    {errors?.allowedUser?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-check form-check-flat form-check-primary">
                            <label className="form-check-label">
                            <input {...register('isPercentage')} type="checkbox" className="form-check-input" />
                                Is percentage discount type?
                                <i className="input-helper" />
                            </label>
                        </div>

                        {renderValueCoupon(getValues('isPercentage'))}

                        <div className='text-center'>
                            <button style={{display: 'flex'}} type='submit' className="btn btn-success me-2 mt-4" disabled={!isValid}>
                                <i className='mdi mdi-plus mr-2'></i>
                                Create coupon
                            </button>
                        </div>

                    </form>
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
