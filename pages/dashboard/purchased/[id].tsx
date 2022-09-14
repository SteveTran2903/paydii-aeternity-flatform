import type { ReactElement } from 'react'
import LayoutDashboard from '../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { contractOwnerAddress, contractName, currentNetwork} from '../../../network-config';
import { StringAsciiCV,stringUtf8CV,uintCV, trueCV,falseCV, stringAsciiCV, cvToHex, hexToCV, standardPrincipalCV , ClarityType } from '@stacks/transactions';
import { ReadOnlyFunctionSuccessResponse } from '@stacks/blockchain-api-client';
import {contractsApi} from '../../../api/config';
import { useRouter } from 'next/router'
import { appDetails } from "../../../lib/constants"
import { useTransactionToasts } from "../../../providers/TransactionToastProvider";
import { ContractCallRegularOptions, openContractCall, UserData } from "@stacks/connect";
import truncateMiddle from "../../../lib/truncate";

import { useStacks } from "../../../providers/StacksProvider";
import Swal from 'sweetalert2'
import LoadingData from '../../../components/LoadingData';

const Page: NextPageWithLayout = () => {

    const router = useRouter()
    const { id } = router.query
    console.log(id)

    const { register, handleSubmit, setValue, getValues, formState: {isValid, errors} } = useForm({mode: 'onChange'});
    const { addTransactionToast } = useTransactionToasts()

    const regexWebsite = new RegExp(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/gm)

    const [dataProductDetail, setDataProductDetail] = useState(null);
    const [imageProductTemp, setImageProductTemp] = useState('');
    const [listFileUpload, setListFileUpload] = useState([]);
    const [loadingData, setLoadingData] = useState(true)

    const dataUserSession = useStacks()
    
    useEffect(() => {
        if(id) {
            getProductByID(id)
            getUrlGaiaFromMongoDB(id)
        }
        // 
    },[router.query])


    const handleEditProduct = (dataForm:any) => {
        console.log("dataForm",dataForm)
        editProduct(dataForm)
    }

    const getUrlGaiaFromMongoDB = async (productID:any) => {

        const data = {
            "product_id": productID
        }

        const response = await fetch('https://paydii-api.herokuapp.com/findOne', { 
            method: 'POST', 
            headers: new Headers({
                'Accept': 'application/ejson',
                'Access-Control-Request-Headers': '*',
                'Content-Type': 'application/json'
            }), 
            body: JSON.stringify(data)
        });

        if(response.status == 200) {
            const dataUrlObj = await response.json();
            console.log('listproductDownloadURL', dataUrlObj)
            if(dataUrlObj['document']) {
                if(dataUrlObj['document']['download_links']) {
                    let listLinkDownLoad = dataUrlObj['document']['download_links'].split(',')
                    
                    let listObjFormat = listLinkDownLoad.map((item:any) => {
                        let tempObj = {
                            name: '....' + item.slice(item.length - 35, item.length),
                            urlServer : item
                        }
                        return tempObj
                    }) 
 
                    listFileUpload= toObject(listObjFormat)
                    setListFileUpload(toObject(listObjFormat))
                    setLoadingData(false)
                }
            }
        }
       
    }

    const updateUrlGaiaToMongoDB = async (productID:string) => {

        let listUrl = listFileUpload.map((item:any) => {
            return item.urlServer
        })

        const data = {
                "product_id": productID,
                "download_links": listUrl.join(',')
            }
    
       
        const response = await fetch('https://paydii-api.herokuapp.com/updateOne', { 
            method: 'POST', 
            headers: new Headers({
                'Accept': 'application/ejson',
                'Access-Control-Request-Headers': '*',
                'Content-Type': 'application/json'
            }), 
            body: JSON.stringify(data)
        });

        console.log(response)
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
            body: JSON.stringify(obj) // body data type must match "Content-Type" header
          });
        console.log(response)
    }


    const editProduct = async (dataProduct:any) => {

        if(listFileUpload.length == 0 ) {
            Swal.fire({
                icon: 'error',
                title: 'Oops... You forgot import File!',
                text: 'You forgot to import the file when the user bought your product',
              })
        }
        else {
            const network = new currentNetwork()

            let data;
            
            if (dataProduct['activeProduct']) {
                data = [
                    stringAsciiCV(id),
                    stringAsciiCV(dataProduct['productName']),
                    stringUtf8CV(dataProduct['productDescription']),
                    stringAsciiCV(dataProduct['productImage']),
                    uintCV(Number(dataProduct['priceOfProduct']*1000000)),
                    trueCV()
                ]
            } else {
                data = [
                    stringAsciiCV(id),
                    stringAsciiCV(dataProduct['productName']),
                    stringUtf8CV(dataProduct['productDescription']),
                    stringAsciiCV(dataProduct['productImage']),
                    uintCV(Number(dataProduct['priceOfProduct']*1000000)),
                    falseCV()
                ]
            }

            const options: ContractCallRegularOptions = {
            contractAddress: contractOwnerAddress,
            contractName: contractName,
            functionName: 'update-product',
            functionArgs: data,
            network,
            appDetails,
            onFinish: ({ txId }) => {
                    writeProductIdAndTxIdToJsonFile(dataUserSession.address,txId, 'edit-product')
                    updateUrlGaiaToMongoDB(id)
                    addTransactionToast(txId, `Update Product ${dataProduct['productName']} to ${truncateMiddle(contractOwnerAddress)}...`)
                    Swal.fire({
                        icon: 'success',
                        title: 'Updating this product on Stacks blockchain, please wait for a moment!',
                        text: 'Estimated completion time: 3 to 5 minutes or maybe sooner',
                        showConfirmButton: true
                    }).then((result) => {
                        router.push('/seller/catalog/products')
                    })
                },
            }

            await openContractCall(options)
        }
    }

    const getProductByID = async (id:any) => {
        const principal: string = contractOwnerAddress
      
        const productID: StringAsciiCV = stringAsciiCV(id);
      
        console.log('id: ' + id)
  
        // call a read-only function
  
        const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
          contractAddress: principal,
          contractName: contractName,
          functionName: 'get-product-by-id',
          readOnlyFunctionArgs: {
            sender: principal,
            arguments: [cvToHex(productID)],
          },
        });
  
        if(fnCall.result !== undefined) {
            let dataProduct:any = hexToCV(fnCall.result)
            console.log(dataProduct)

            let dataFormat = dataProduct['value']['data']
    
            setValue('productName', dataFormat['name'].data, { shouldValidate: true })
            setValue('productDescription', dataFormat['description'].data, { shouldValidate: true })
            setValue('productImage', dataFormat['img'].data, { shouldValidate: true })
            setImageProductTemp(dataFormat['img'].data)
            setValue('priceOfProduct', (Number(dataFormat['price'].value))/1000000, { shouldValidate: true })
            
            let data:any = {
                id: id,
                name: dataFormat['name'].data,
                description: dataFormat['description'].data,
                img: dataFormat['img'].data,
                price: Number(dataFormat['price'].value),
                seller: dataFormat['seller'],
            }
    
            if(dataFormat['is-active'].type  === ClarityType.BoolTrue) {
            data['is-active'] = true
            setValue('activeProduct', true)

            }
            if(dataFormat['is-active'].type  === ClarityType.BoolFalse) {
            data['is-active'] = false
            setValue('activeProduct', false)
            }
            console.log("data: ",data)
            setDataProductDetail(toObject(data))
            console.log(dataProductDetail)
        }
    }
    
    const toObject = (data : object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }
  
    const handleChange = (event:any) => {
        setImageProductTemp(event.target.value)
    }

    const goToUrl = (url:string) => {
        window.open(url,'_blank');
    }

    const removeFileServer = async (file:any) => {
        console.log(file)
        let path = 'fileProduct/' + file.name

        const removeResponse = await dataUserSession.storage.deleteFile(path);

        console.log(removeResponse)
    }


    const removeFile = (fileObj:any, index:number) =>{
        removeFileServer(fileObj)
        
        // remove file in local
        let array = toObject(listFileUpload)
        array.splice(index, 1);
        listFileUpload= array
        setListFileUpload(toObject(array))
    }

    const uploadToClient = (event:any) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];
            uploadToServer(i)
        }
    };

    const uploadToServer = async (file:any) => {
       
        console.log(file)
        let path = 'fileProduct/' + file.name

        let putFileOptions = {
            contentType: file.type, 
            encrypt: false,
            dangerouslyIgnoreEtag: true
        }
       
        const fileUrl = await dataUserSession.storage.putFile(path,file, putFileOptions);

        console.log(fileUrl)

        let objData = {
            urlServer : fileUrl,
            name: file.name
        }

        listFileUpload.push(objData)
        setListFileUpload(toObject(listFileUpload))
    };
    

    const renderDownloadFileWhenEditProduct = () => {
        return (
            <div className="row">
                <div className="col-md-12 mt-4">
                    <div className="form-group">
                        <div className='list-file-upload'>
                            {listFileUpload.map((item:any, index:number) => {
                                return (
                                    <div key={index} className="item-filer-upload">
                                        <div className='file-name'>
                                            {item.name}
                                        </div>
                                        <div className='group-button-control d-flex '>
                                            <button onClick={(e) => {e.preventDefault(); goToUrl(item.urlServer)}} className="btn btn-sm btn-warning mr-3 d-flex align-items-center pl-2 pr-2" >
                                                <i className='mdi mdi-eye mr-2'></i>
                                                View And Download file
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }


    return (
        <div className="row">
            <div className="col-md-10 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body text-center">
                        <h2 className='text-success'>
                        Thank you for purchasing this product!
                        </h2>

                        <h5 className='text-info'>
                        Below are the product files, please download and use them. Thank you!
                        </h5>
                        <div className='mt-5' style={{position: 'relative'}}>
                            <LoadingData loading={loadingData}></LoadingData>
                        </div>
                        {renderDownloadFileWhenEditProduct()}
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