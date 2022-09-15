import { useEffect, useState } from "react";
import SecondaryButton from "./SecondaryButton";
import Link from "next/link";
import Swal from 'sweetalert2'
import { useAeternity } from "../providers/AeternityProvider";
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '25%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#app');

export default function Auth() {

  let subtitle: any;

  const [network, setNetwork] = useState('testnet')
  const dataUserSession = useAeternity()

  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {

  }, []);

  const openModal = () => {
    setIsOpen(true);
  }


  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }




  const handleLogIn = () => {
    // openModal()
    dataUserSession.handleLogIn()
  }

  const truncateAddress = (address: string) => {
    if (address && typeof (address) == 'string') {
      let p_1 = address.slice(0, 8)
      let p_2 = address.slice(address.length - 5, address.length)
      return p_1 + '...' + p_2
    }
  }

  const renderChangeNetwork = () => {
    return (
      <li className="nav-item dropdown d-none d-lg-block address-logined mr-2 network-main">
        <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split text-address-login" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
          <span style={{ textTransform: 'capitalize' }}>{network}</span>
        </a>
        <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">
          <div className="dropdown-item preview-item" onClick={(e) => { e.preventDefault(); handleChangeNetwork('mainnet') }}>
            Mainnet
          </div>
          <div className="dropdown-item preview-item" onClick={(e) => { e.preventDefault(); handleChangeNetwork('testnet') }}>
            Testnet
          </div>
        </div>
      </li>
    )
  }

  const logout = () => {
    try {
      dataUserSession.handleLogOut()
    } catch (error) {
      // TODO
    }


  }

  if (dataUserSession.address) {
    return (
      <div className="d-flex">
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
          <button onClick={closeModal}>close</button>
          <div>I am a modal</div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
        {/* {renderChangeNetwork()} */}
        <li className="nav-item dropdown d-none d-lg-block address-logined">
          <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split text-address-login" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
            {truncateAddress(dataUserSession.address)}
          </a>

          <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">

            <Link href={'/dashboard'}>
              <div className="dropdown-item preview-item">
                <i className="dropdown-item-icon mdi mdi-view-dashboard text-primary me-2" />
                Dashboard
              </div>
            </Link>

            <div className="dropdown-item preview-item" onClick={(e) => handleLogIn()}>
              <i className="dropdown-item-icon mdi mdi-account-outline text-primary me-2" />
              Change Account
            </div>

            <div className="dropdown-item preview-item" onClick={(e) => logout()}>
              <i className="dropdown-item-icon mdi mdi-power text-primary me-2" />
              Sign Out
            </div>

          </div>

        </li>
      </div>
    )
  } else {
    return (
      
      <div className="d-flex">
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
          <button onClick={closeModal}>close</button>
          <div>I am a modal</div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
        {/* {renderChangeNetwork()} */}
        <button type="button" className="btn btn-outline-info" onClick={handleLogIn}>Connect Wallet</button>
      </div>
    )
  }
}