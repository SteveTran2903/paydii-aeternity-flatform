import { PropsWithChildren } from "react";
import Sidebar from "./dashboardComponents/Sidebar";
import { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast'

import AeternityProvider from '../providers/AeternityProvider'

import HeaderDashboard from "./dashboardComponents/HeaderDashboard";
import ProgressBar from "./ProgressBar";

export default function LayoutDashboard({ children }: PropsWithChildren<{}>) {

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, [])

  return (
    <AeternityProvider>
      <div>
        <div className="container-scroller">
          <ProgressBar></ProgressBar>
          <HeaderDashboard></HeaderDashboard>

          <div className="container-fluid page-body-wrapper">
            <Sidebar></Sidebar>
            <div className="main-panel">
              <div className="content-wrapper">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AeternityProvider>
  )
}
