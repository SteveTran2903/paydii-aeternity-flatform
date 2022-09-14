import { useStacks } from "../providers/StacksProvider"
import { useEffect, useState } from "react"
import {currentNetwork, isMainnet} from "../network-config";
import { getTxsMempoolForAddress } from "../api/transaction";

export default function ProgressBar() {
    
    const network = new currentNetwork()
    // const dataUserSession = useStacks()
    console.log('progressbar')
   
    const [havePendingTx, setHavePendingTx] = useState(false)
    const [listTxPending, setListTxPending] = useState([])

    // useEffect(() => {
    //     if(dataUserSession.address) {
    //         initData(dataUserSession.address)
    //         setInterval(function () {
    //             setListTxPending([])
    //             initData(dataUserSession.address)
    //         }, 30000);
    //     }
    // },[dataUserSession.address])
    

    const initData = (address:string) => {
        getTxsMempoolForAddress(dataUserSession.address).then(txsInfo => {
            console.log('totalMempool', txsInfo.results)
            if(txsInfo.results.length > 0) {
                setHavePendingTx(true)
            } else {
                setHavePendingTx(false)
                setListTxPending([])
            }
            let toObj = toObject(txsInfo.results)
            setListTxPending(listTxPending => [...listTxPending, ...toObj])
            console.log('listTxPending',listTxPending)
        })
    }


    const toObject = (data : object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    const getURL = (tx:string) => {
        let url = ''
        if(isMainnet) {
            url = 'https://explorer.stacks.co/txid/' + tx + '?chain=mainnet'
        } else {
            url = 'https://explorer.stacks.co/txid/' + tx + '?chain=testnet'
        }
        return url
    } 

    const gotoURL = (url:string) => {
        window.open(url, '_blank')
    }

    const renderButtonTx= () => {
        return listTxPending.map((item:any, key:number) => {
            let url = getURL(item.tx_id)
            if(item['contract_call']['function_name'] == 'create-product') {
                return (
                    <div key={key}><button className="mr-2 ml-2 btn btn-sm btn-info btn-tx" onClick={() => gotoURL(url)}>Create Product</button></div>
                )
            }
            if(item['contract_call']['function_name'] == 'update-product') {
                return (
                    <div  key={key}><button className="mr-2 ml-2 btn btn-sm btn-success btn-tx" onClick={() => gotoURL(url)}>Update Product</button></div>
                )
            }
            if(item['contract_call']['function_name'] == 'create-coupon') {
                return (
                    <div  key={key}><button className="mr-2 ml-2 btn btn-sm btn-warning btn-tx" onClick={() => gotoURL(url)}>Create Coupon</button></div>
                )
            }
            if(item['contract_call']['function_name'] == 'update-coupon') {
                return (
                    <div  key={key}><button className="mr-2 ml-2 btn btn-sm btn-success btn-tx" onClick={() => gotoURL(url)}>Update Coupon</button></div>
                )
            }
            if(item['contract_call']['function_name'] == 'buy-product' || item['contract_call']['function_name'] == 'buy-product-with-coupon') {
                return (
                    <div  key={key}><button className="mr-2 ml-2 btn btn-sm btn-warning btn-tx" onClick={() => gotoURL(url)}>Buy Product</button></div>
                )
            }
            if(item['contract_call']['function_name'] == 'add-review') {
                return (
                    <div  key={key}><button className="mr-2 ml-2 btn btn-sm btn-success btn-tx" onClick={() => gotoURL(url)}>Review Product</button></div>
                )
            }
            
        })
    }

    return (
    <div className={havePendingTx == true ? "progress-bar-main" : "display-none"}>
        <div className="progress progress-striped active">
            <div role="progressbar progress-striped" style={{width: '100%'}} className="progress-bar">
                <div className="text-alert">You have {listTxPending.length} transaction(s) still pending ....</div>
                {renderButtonTx()}
            </div>
        </div>
    </div>
    )
}
  