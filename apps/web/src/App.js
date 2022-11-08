import { useEffect, useState } from 'react';
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box
} from '@chakra-ui/react';
import SelectWalletModal from './Modal';
import { useWeb3React } from '@web3-react/core';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Tooltip } from '@chakra-ui/react';
import { networkParams } from './networks';
import { connectors } from './connectors';
import { toHex, truncateAddress } from './utils';
import useWallet from './hooks/useWallet';
import { HDKEY, DID } from '@functionland/fula-sec';
import splitKey from 'shamirs-secret-sharing'
import sha3 from 'js-sha3'
import * as u8a from 'uint8arrays'

function _splitKey(prime) {
  let _splitKey = []
  const shares = splitKey.split(Buffer.from(prime), { shares: 2, threshold: 2 })
  shares.forEach((element) => {
      _splitKey.push(element.toString('hex'))
  });
  return _splitKey
}

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    getAccount,
    getSignature,
    connectWallet,
    verifyMessage: verifySignMetamask
  } = useWallet();


  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const [metamaskAcc, setMetamaskAcc] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [secretKey,setSecretKey] = useState('')
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [verified, setVerified] = useState();

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInputSecret = (e) => {
    const msg = e.target.value;
    setSecretKey(msg);
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };
  const realAccount = metamaskAcc || account;

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const connectMetamask = async () => {
    try {
      connectWallet();
      const acc = await getAccount();
      console.log(acc);
      setMetamaskAcc(acc[0]);
    } catch (err) {}
  };

  const getKeys = async () => {
    try{
      let keys = _splitKey(u8a.fromString(secretKey))
      console.log('Keys: ', keys)
      
      const sign = await getSignature(keys?.[0],realAccount)
      console.log('Signature: ', sign)

      setSignature(sign)

      let hexSeed = sha3.keccak256(JSON.stringify({
          secretKey: keys?.[1],
          signature: sign
      }));
      console.log('Seed hex: ', hexSeed)

      const ed = new HDKEY(hexSeed)
      console.log('Ed: ',ed);

      const master = ed.createEDKey()
      console.log('Master: ',master);

      const idid = new DID(ed._secretKey.slice(0, 32), master.publicKey);
      console.log('iDID: ', idid)

      const did = await idid.getDID();
      console.log('ParentDID: ', did)

    }catch(err){
      console.log(err);
    }
  }


  const signMessage = async () => {
    let signature;
    // if (!library) return;

    try {
      if (!!metamaskAcc) {
        signature = await getSignature(message, metamaskAcc);
      } else
        signature = await library.provider.request({
          method: 'personal_sign',
          params: [message, account]
        });

      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };
  

  const verifyMessage = async () => {
    // if (!library) return;
    let verify;
    try {
      if (!!metamaskAcc) {
        verify = await verifySignMetamask(signedMessage, signature);
      } else
        verify = await library.provider.request({
          method: 'personal_ecRecover',
          params: [signedMessage, signature]
        });
      setVerified(verify === realAccount.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    window.localStorage.setItem('provider', undefined);
    setNetwork('');
    setMessage('');
    setSignature('');
    setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    const provider = window.localStorage.getItem('provider');
    if (provider) activate(connectors[provider]);
  }, []);

  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={['1.5em', '2em', '3em', '4em']}
            fontWeight="600"
          >
            Test APP for
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={['1.5em', '2em', '3em', '4em']}
            fontWeight="600"
            sx={{
              background: 'linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Fula-sec
          </Text>
        </HStack>
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {realAccount || active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={realAccount} placement="right">
            <Text>{`realAccount: ${truncateAddress(realAccount)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : 'No Network'}`}</Text>
        </VStack>
        {(!!realAccount || active) && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                  <option value="1666600000">Harmony</option>
                  <option value="42220">Celo</option>
                </Select>
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={getKeys} isDisabled={!secretKey}>
                  Password
                </Button>
                <Input
                  placeholder="Set password"
                  maxLength={20}
                  onChange={handleInputSecret}
                  w="140px"
                />
                {/* {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null} */}
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
      <SelectWalletModal
        handleMetamask={connectMetamask}
        isOpen={isOpen}
        closeModal={onClose}
      />
    </>
  );
}
