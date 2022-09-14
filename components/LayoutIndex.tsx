import { PropsWithChildren } from "react";
import HeaderIndex from "./IndexComponents/HeaderIndex";
import { useEffect } from "react";
import TransactionToastProvider from '../providers/TransactionToastProvider'
import { Toaster } from 'react-hot-toast'
import AeternityProvider from '../providers/AeternityProvider'
import ProgressBar from "./ProgressBar";

export default function LayoutIndex({ children }: PropsWithChildren<{}>) {

  useEffect(()=>{
      import("bootstrap/dist/js/bootstrap");
  },[])

  return (
    <AeternityProvider>
        <ProgressBar></ProgressBar>
        <Toaster position="bottom-right" />
        <HeaderIndex></HeaderIndex>
        <div className="pt-120-px">
            <main className="mb-auto">
              {children}
            </main>
        </div>
    </AeternityProvider>
  )
}
