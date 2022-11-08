import React, { useState } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const handleMetaMask = () => {
    if (typeof window.ethereum !== 'undefined') {
      getAccounts('metamask');
    } else {
      console.log('Please install MetaMask');
    }
  };

  const handleClick = () => {
    handleMetaMask();
  };

  const getAccounts = async () => {
    let accounts;
    try {
      accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      return accounts;
    } catch (err) {
      console.log(err);
    }
  };

  const getSignature = async (message, account) => {
    let signature;

    try {
      signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });

      return signature;
    } catch (err) {
      console.log(err);
    }
  };

  async function getAccount(acc) {
    try {
      const message = `Something`;

      const signature = await getSignature(message, acc);

      return signature;
    } catch (err) {
      console.log(err);
      hanldeLogout();
    }
    return null;
  }

  const verifyMessage = async (signedMessage, signature) => {
    try {
      const verify = await window.ethereum.request({
        method: 'personal_ecRecover',
        params: [signedMessage, signature]
      });

      return verify;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const hanldeLogout = () => {};

  const handleNetwork = async () => {};

  return {
    connectWallet: handleClick,
    handleNetwork,
    getSignature,
    getAccount: getAccounts,
    verifyMessage
  };
};

export default useWallet;
