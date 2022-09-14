import type { ReactElement } from 'react'
import LayoutDashboard from '../../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { contractOwnerAddress, contractName, currentNetwork} from '../../../../network-config';
import { stringUtf8CV,uintCV, trueCV,falseCV, stringAsciiCV, cvToHex, hexToCV, standardPrincipalCV , ClarityType } from '@stacks/transactions';
import { appDetails } from "../../../../lib/constants"
import { useTransactionToasts } from "../../../../providers/TransactionToastProvider";
import { ContractCallRegularOptions, openContractCall, UserData } from "@stacks/connect";
import truncateMiddle from "../../../../lib/truncate";
import {v4 as uuidv4} from 'uuid'
import DataProductTemp from '../../../../data_temp/data_product'
import { useStacks } from "../../../../providers/StacksProvider";
import Swal from 'sweetalert2'
import { useRouter } from 'next/router';
import LoadingData from '../../../../components/LoadingData';




const Page: NextPageWithLayout = () => {
    console.log('new-product')


    const { register, handleSubmit, setValue, getValues, formState: {isValid, errors} } = useForm({mode: 'onChange'});
    const { addTransactionToast } = useTransactionToasts()

    const regexWebsite = new RegExp(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/gm)

    const [imageProductTemp, setImageProductTemp] = useState('');
    const [listFileUpload, setListFileUpload] = useState([]);
    const [loadingData, setLoadingData] = useState(false)



    const dataUserSession = useStacks()
    const router = useRouter()

    useEffect(() => {

    },[])


    const handleCreateProduct = (dataForm:any) => {
        console.log("dataForm",dataForm)
        createProduct(dataForm)
    }

    const initRandomId = () => {
        let myuuid = uuidv4();
        return 'Product' + myuuid
    }

    const writeProductIdToJsonFile = async (prodID:string) => {
        const response = await fetch('/api/products', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(prodID) // body data type must match "Content-Type" header
          });
        console.log(response)

        // return response.json(); // parses JSON response into native JavaScript objects
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

        // return response.json(); // parses JSON response into native JavaScript objects
    }

    const createProduct = async (dataProduct:any) => {
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

            let id = initRandomId()

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
                functionName: 'create-product',
                functionArgs: data,
                network,
                appDetails,
                onFinish: ({ txId }) => {
                    writeProductIdToJsonFile(id)
                    writeProductIdAndTxIdToJsonFile(dataUserSession.address,txId, 'create-product')
                    uploadUrlGaiaToMongoDB(id)
                    addTransactionToast(txId, `Create Product ${dataProduct['productName']} to ${truncateMiddle(contractOwnerAddress)}...`)
                    Swal.fire({
                        icon: 'success',
                        title: 'Creating products on blockchain, please wait a moment!',
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

    const handleChange = (event:any) => {
        setImageProductTemp(event.target.value)
    }

    const setTempDataForProduct = () => {
       let lengthData = DataProductTemp.length
       let randomProductIndex = Math.floor((Math.random() * lengthData));
       let dataProductTemp = DataProductTemp[randomProductIndex]

        setValue('productName', dataProductTemp['name'], { shouldValidate: true })
        setValue('productDescription', dataProductTemp['description'], { shouldValidate: true })
        setValue('priceOfProduct', dataProductTemp['price'], { shouldValidate: true })
        setValue('productImage', dataProductTemp['img'], { shouldValidate: true })
        setValue('activeProduct', true, { shouldValidate: true })
        setImageProductTemp( dataProductTemp['img'])

    }

    const toObject = (data : object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    const removeFileServer = async (file:any) => {
        console.log(file)
        let path = 'fileProduct/' + file.name

        const removeResponse = await dataUserSession.storage.deleteFile(path);

        console.log(removeResponse)
    }

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
        setLoadingData(false)
    };

    const uploadUrlGaiaToMongoDB = async (productID:string) => {

        let listUrl = listFileUpload.map((item:any) => {
            return item.urlServer
        })

        const data = {
                "product_id": productID,
                "download_links": listUrl.join(',')
            }


        const response = await fetch('https://paydii-api.herokuapp.com/insertOne', {
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

    const uploadToClient = (event:any) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];
            const size = i.size/(1024 * 1024)
            if(size > 20) {
                Swal.fire({
                    icon: 'error',
                    title: 'Can not upload file!',
                    text: 'File size must be less than 20 megabytes',
                  })
            } else {
                setLoadingData(true)
                uploadToServer(i)
            }

        }
    };

    const goToUrl = (url:string) => {
        window.open(url,'_blank');
    }

    const removeFile = (fileObj:any, index:number) =>{
        removeFileServer(fileObj)

        // remove file in local
        let array = toObject(listFileUpload)
        array.splice(index, 1);
        listFileUpload= array
        setListFileUpload(toObject(array))
    }

    const renderDownloadFileWhenBuyDone = () => {
        return (
            <div className="row">
                <div className="col-md-9 mt-4">
                    <div className="form-group">
                        <h6>Content Delivery (Your customer can access these files)</h6>
                        <span className=''>Files are auto-saved to <a href="https://docs.stacks.co/docs/gaia/#:~:text=Stacks%20uses%20the%20routing%20data,on%20a%20cloud%20software%20provider." target="_blank">Gaia (a decentralized storage system powered by Stacks blockchain)</a> after you upload!</span>

                        <div className='list-file-upload'>
                            <LoadingData loading={loadingData}></LoadingData>
                            {listFileUpload.map((item:any, index:number) => {
                                return (
                                    <div key={index} className="item-filer-upload">
                                        <div className='file-name'>
                                            {item.name}
                                        </div>
                                        <div className='group-button-control d-flex '>
                                            <button onClick={(e) => {e.preventDefault();goToUrl(item.urlServer)}} className="btn btn-sm btn-info mr-3 d-flex align-items-center pl-2 pr-2" >
                                                <i className='mdi mdi-eye mr-2'></i>
                                                View
                                            </button>

                                            <button onClick={() => removeFile(item, index)} className="btn btn-sm btn-danger d-flex align-items-center">
                                                <i className='mdi mdi-delete mr-2'></i>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className='add-file-button'>
                                Choose file
                                <input type="file" className='file-input' name="myImage" onChange={uploadToClient} />
                            </div>
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
                <div className="card-body">

                    <form className="forms-seller-product" onSubmit={handleSubmit(handleCreateProduct)}>
                        <div className="form-group">
                            <label>Product name (*)</label>
                            <input {...register('productName', { value: '', required: true } )}  type="text" className="form-control" placeholder="Enter name of product"/>
                            {errors?.productName?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                        </div>

                        <div className="form-group">
                            <label>Product description (*)</label>
                            <textarea {...register('productDescription', { required: true } )} rows={10}  className="form-control" placeholder="Enter description of product" />
                            {errors?.productDescription?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Price of product in STX (*)</label>
                                    <input step='any' type="number" {...register('priceOfProduct', { required: true, valueAsNumber: true} )} min={0} className="form-control" placeholder="Set price of product (STX)" />
                                    {errors?.priceOfProduct?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                    {errors?.priceOfProduct?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                                </div>
                                <div className="form-group">
                                    <label >Product image URL (*)</label>
                                    <textarea {...register('productImage', { required: true, pattern: regexWebsite, onChange: (e) => {handleChange(e)} } )} rows={3} className="form-control" placeholder="Enter image of product, input exactly link of image." />
                                    {errors?.productImage?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                    {errors?.productImage?.type === 'pattern' && <span className='text-error-form'>Format link of image incorret!</span>}
                                </div>
                            </div>
                            <div className="col-md-6">
                               <div>
                                    <img src={imageProductTemp} className="image-seller-view-product"></img>
                               </div>
                            </div>
                        </div>





                        <div className="form-check form-check-flat form-check-primary">
                            <label className="form-check-label">
                            <input {...register('activeProduct')} type="checkbox" className="form-check-input" />
                            Active (you want to sell it product otherwise it will be hidden)
                            <i className="input-helper" /></label>
                        </div>

                        {renderDownloadFileWhenBuyDone()}

                        <div className='text-center'>
                            <button type='submit' className="btn btn-success me-2 mt-4" disabled={!isValid}>
                                <i className='mdi mdi-grease-pencil'></i>
                                Create product
                            </button>
                        </div>

                    </form>
                </div>
                </div>
            </div>

            <div className="col-md-2">
                <button type="button" className="btn btn-info btn-fw"  onClick={() => setTempDataForProduct()} >Use sample data</button>
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
