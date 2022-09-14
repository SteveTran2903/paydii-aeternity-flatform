import { useEffect, useState } from "react";
import Link from 'next/link'

export default function TableCoupons(props:any) {

  console.log('datatable', props.dataTable)
  

  const renderColTypeTable = (isPercent:boolean) => {
    if(isPercent) {
      return(
        <h6 className="text-info">
           Percent
        </h6>
      )
    } else {
      return(
        <h6 className="text-success">
           Amount
        </h6>
      )
    }
  }
  const renderColValueTable = (isPercent:boolean, valueAmount: number, valuePercent: number) => {
    if(isPercent) {
      return(
        <h6>
           {valuePercent} <span className="text-info">%</span>
        </h6>
      )
    } else {
      return(
        <h6>
           {valueAmount} <span className="text-success">STX</span>
        </h6>
      )
    }
  }
  

  const renderRowTable = () => {
    if(props.dataTable.length >0) {
       return props.dataTable.map((item:any,index:number) => {
        return (
          <tr key={index} className="row-table-coupons">
            <td>
              <h6>
                {item['code']}
              </h6>
            </td>
            <td>
              {renderColTypeTable(item['is-percentage'])}
            </td>
            <td>
              {renderColValueTable(item['is-percentage'], item['value-amount'],item['value-percent'] )}
            </td>
            <td>
              <h6>{item['allowed-uses']}</h6>
            </td>
            <td>
              <Link href={'/seller/catalog/coupon/'+item['product-id'] +'/' + item['code']}>
                <button style={{display: 'flex'}} className="button-view-detail-table btn-sm flex btn btn-warning btn-otline-dark align-items-center">
                  <i className="mdi mdi-grease-pencil mr-1" />
                    Edit
                </button>
              </Link>
            </td>
          </tr>
        )
      })    
    } else {
      return <></>
    }
  }

  const renderNoData = () => {
    if( props.dataTable.length ==0) {
      return (
        <div className="text-danger">You don't have any coupons yet. Let's create!</div>
      )
    } else {
      return <></>
    }
  }
 

  return (
    <div>
      <table className="table select-table table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Times Used</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {renderRowTable()}
          </tbody>
      </table>
      {renderNoData()}
    </div>
  )
}
