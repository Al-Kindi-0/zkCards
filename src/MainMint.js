import { useState } from 'react';
import { ethers } from 'ethers';
import zkCards from './zkCards.json';
import { mintCalldata } from './zkProofs/mint/mintCallData';
import { shieldCalldata } from './zkProofs/shield/shieldCallData';
import { unshieldCalldata } from './zkProofs/unshield/unshieldCallData';
import { sellCalldata } from './zkProofs/sell/sellCallData';
import { transferCalldata } from './zkProofs/transfer/transferCallData';

const zkCardsAddress = "0x2de4270093D550F5bAFe462A583eC0b712796aAd";
//var Web3 = require('web3');
//var web3 = new Web3();

const MainMint = ({ accounts, setAccounts }) => {
    //const [mintAmount, setMintAmount] = useState(1);
    const [attribute1, setAttribute1] = useState(1);
    const [attribute2, setAttribute2] = useState(1);
    const [attribute3, setAttribute3] = useState(1);
    const [hashKey, setHashKey] = useState(1);

    const isConnected = Boolean(accounts[0]);

    async function handleMint() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {
                //const response = await contract.mint(BigNumber(mintAmount));
                const callD = await mintCalldata(attribute1, attribute2, attribute3, hashKey);
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.mint(...callD);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    async function handleShield() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {
                //const response = await contract.mint(BigNumber(mintAmount));
                const callD = await shieldCalldata(shieldId, secretKey);
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.shield(...callD);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    async function handleUnshield() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {


                // {"id":"44","address":"636","root":"163","secret":"3","pathElements":["2","3","3"],"pathIndices":["0","0","1"]}
                const callD = await unshieldCalldata(shieldId, address, root, secretKey, path_elements, path_indices);
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.transfer(...callD);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    async function handleTransfer() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {


                //{"id":"33","root":"33","secret":93984,"pubKeyReceiver":"2323","pathElements":["33","44","33"],"pathIndices":["1","1","0"]}
                const callD = await transferCalldata(shieldId, root, secretKey, pubKey, path_elements, path_indices);
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.transfer(...callD);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    async function handleSell() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {


                //{"id":","root":","secret":22,"pubKeyReceiver":""attribute1":2,"attribute2":4,"attribute3":3,"hashKey":88}
                const callD = await sellCalldata(shieldId, root, secretKey, pubKey, path_elements, path_indices, attribute1, attribute2, attribute3, hashKey);
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.sell(...callD);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    /*
        const handleIncrement = () => {
            if (mintAmount >= 3) return;
            setMintAmount(mintAmount + 1);
        };
        const handleDecrement = () => {
            if (mintAmount <= 1) return;
            setMintAmount(mintAmount - 1);
        };
    
               <div>
                            <button onClick={handleDecrement}>-</button>
                            <input type="number" value={mintAmount} />
                            <button onClick={handleIncrement}>+</button>
                        </div>
    */
    const handleIncrement1 = () => {
        if (attribute1 >= 10) return;
        setAttribute1(attribute1 + 1);
    };
    const handleDecrement1 = () => {
        if (attribute1 <= 1) return;
        setAttribute1(attribute1 - 1);
    };
    const handleIncrement2 = () => {
        if (attribute2 >= 10) return;
        setAttribute2(attribute2 + 1);
    };
    const handleDecrement2 = () => {
        if (attribute2 <= 1) return;
        setAttribute2(attribute2 - 1);
    };
    const handleIncrement3 = () => {
        if (attribute3 >= 10) return;
        setAttribute3(attribute3 + 1);
    };
    const handleDecrement3 = () => {
        if (attribute3 <= 1) return;
        setAttribute3(attribute3 - 1);
    };
    const handleIncrementHash = () => {
        if (hashKey >= 10000000000000000000000000000000000000) return;
        setHashKey(hashKey + 1);
    };
    const handleDecrementHash = () => {
        if (hashKey <= 1) return;
        setHashKey(hashKey - 1);
    };

    // Shield logic

    const [shieldId, setValueShieldId] = useState('');

    const handleChangeShieldId = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValueShieldId(result);
    };

    const [secretKey, setValueSecretKey] = useState('');

    const handleChangeSecretKey = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValueSecretKey(result);
    }

    // Unshield logic

    const [address, setValueAddress] = useState('');
    const [root, setValueRoot] = useState('')
    const [path_elements, setValuePath_elements] = useState('');
    const [path_indices, setValuePath_indices] = useState('');

    const handleChangeAddress = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValueAddress(result);
    }

    const handleChangeRoot = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValueRoot(result);
    }

    const handleChangePathElements = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValuePath_elements(result);
    }
    const handleChangePathIndices = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValuePath_indices(result);
    }
    // Transfer logic
    const [pubKey, setValuePubKey] = useState('');
    const handleChangePubKey = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValuePubKey(result);
    }
    // Sell logic

    const handleChangeAttribute1 = event => {
        const result = event.target.value.replace(/\D/g, '');

        setAttribute1(result);
    }
    const handleChangeAttribute2 = event => {
        const result = event.target.value.replace(/\D/g, '');

        setAttribute2(result);
    }
    const handleChangeAttribute3 = event => {
        const result = event.target.value.replace(/\D/g, '');

        setAttribute3(result);
    }
    const handleChangeHashKey = event => {
        const result = event.target.value.replace(/\D/g, '');

        setHashKey(result);
    }

    return (
        <div>
            <h1>ZkCards</h1>
            <p>The world of secret magical cards</p>
            {isConnected ? (
                <div>
                    <div>
                        <h1>Mint your zkCard</h1>
                        <p>Select the combination of attributes that you would like to mint</p>
                        <div>
                            <button onClick={handleDecrement1}>-</button>
                            <input type="number" value={attribute1} />
                            <button onClick={handleIncrement1}>+</button>
                        </div>
                        <div>

                            <button onClick={handleDecrement2}>-</button>
                            <input type="number" value={attribute2} />
                            <button onClick={handleIncrement2}>+</button>
                        </div>
                        <div>
                            <button onClick={handleDecrement3}>-</button>
                            <input type="number" value={attribute3} />
                            <button onClick={handleIncrement3}>+</button>
                        </div>
                        <div>
                            <button onClick={handleDecrementHash}>-</button>
                            <input type="number" value={hashKey} />
                            <button onClick={handleIncrementHash}>+</button>
                        </div>
                        <button onClick={handleMint}>Mint Now</button>
                    </div>

                    <div>
                        <h1>Shield your zkCard</h1>
                        <p>Enter the following in order to shield your zkCard:</p>
                        <div>
                            <input
                                type="text"
                                placeholder="ZkCard Id"
                                value={shieldId}
                                onChange={handleChangeShieldId}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Secret key"
                                value={secretKey}
                                onChange={handleChangeSecretKey}
                            />
                        </div>
                        <button onClick={handleShield}>Shield Now</button>
                    </div>

                    <div>
                        <h1>UnShield your zkCard</h1>
                        <p>Enter the following in order to shield your zkCard:</p>
                        <div>
                            <input
                                type="text"
                                placeholder="ZkCard Id"
                                value={shieldId}
                                onChange={handleChangeShieldId}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Secret key"
                                value={secretKey}
                                onChange={handleChangeSecretKey}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Address (current one)"
                                value={address}
                                onChange={handleChangeAddress}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Root"
                                value={root}
                                onChange={handleChangeRoot}
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Path Elements"
                                value={path_elements}
                                onChange={handleChangePathElements}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Path Indices"
                                value={path_indices}
                                onChange={handleChangePathIndices}
                            />
                        </div>

                        <button onClick={handleUnshield}>UnShield Now</button>
                    </div>

                    <div>
                        <h1>Transfer your zkCard</h1>
                        <p>Enter the following in order to transfer your zkCard privately:</p>
                        <div>
                            <input
                                type="text"
                                placeholder="ZkCard Id"
                                value={shieldId}
                                onChange={handleChangeShieldId}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Secret key"
                                value={secretKey}
                                onChange={handleChangeSecretKey}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Public key of receiver"
                                value={pubKey}
                                onChange={handleChangePubKey}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Root"
                                value={root}
                                onChange={handleChangeRoot}
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Path Elements"
                                value={path_elements}
                                onChange={handleChangePathElements}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Path Indices"
                                value={path_indices}
                                onChange={handleChangePathIndices}
                            />
                        </div>

                        <button onClick={handleTransfer}>Transfer Now</button>
                    </div>

                    <div>
                        <h1>Sell your zkCard</h1>
                        <p>Enter the following in order to sell your zkCard to a public bid:</p>
                        <div>
                            <input
                                type="text"
                                placeholder="ZkCard Id (original)"
                                value={shieldId}
                                onChange={handleChangeShieldId}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Secret key"
                                value={secretKey}
                                onChange={handleChangeSecretKey}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Public key of receiver"
                                value={pubKey}
                                onChange={handleChangePubKey}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Root"
                                value={root}
                                onChange={handleChangeRoot}
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Path Elements"
                                value={path_elements}
                                onChange={handleChangePathElements}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Path Indices"
                                value={path_indices}
                                onChange={handleChangePathIndices}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Attribute1"
                                value={attribute1}
                                onChange={handleChangeAttribute1}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Attribute2"
                                value={attribute2}
                                onChange={handleChangeAttribute2}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Attribute3"
                                value={attribute3}
                                onChange={handleChangeAttribute3}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Hash Key used when minting"
                                value={hashKey}
                                onChange={handleChangeHashKey}
                            />
                        </div>

                        <button onClick={handleSell}>Sell Now</button>
                    </div>
                </div>
            ) : (
                <p> You must be connected</p>

            )}
        </div>
    );
};
export default MainMint;