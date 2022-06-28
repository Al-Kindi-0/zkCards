import { useState } from 'react';
import { ethers } from 'ethers';
import zkCards from './zkCards.json';
import { mintCalldata } from './zkProofs/mint/mintCallData';
import { shieldCalldata } from './zkProofs/shield/shieldCallData';
import { unshieldCalldata } from './zkProofs/unshield/unshieldCallData';
import { sellCalldata } from './zkProofs/sell/sellCallData';
import { transferCalldata } from './zkProofs/transfer/transferCallData';
const poseidon = require("circomlibjs").poseidon;
const mimcsponge = require("circomlibjs").mimcsponge;
const Tree = require("fixed-merkle-tree");

//const zkCardsAddress = "0x2de4270093D550F5bAFe462A583eC0b712796aAd";
const zkCardsAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const { BigNumber, BigNumberish } = require("ethers");


const MERKLE_TREE_HEIGHT = 3;

//const {transferCalldata} = require('./callDataFunctions.js')

const { groth16 } = require("snarkjs");
//var Web3 = require('web3');
//var web3 = new Web3();
/* global BigInt */
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
    async function handleBid() {
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
                const callD = await [toFixedHex(pubKey_New), toFixedHex(attribute1), toFixedHex(attribute2), toFixedHex(attribute3)];
                //const callD = "let there";
                const options = { value: ethers.utils.parseEther(bidValue.toString()) }
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.makeBid(...callD, options);
                console.log('response:', response_);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }
    async function handleCancelBid() {
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
                const callD = await [toFixedHex(pubKey_New), toFixedHex(attribute1), toFixedHex(attribute2), toFixedHex(attribute3)];
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                const response_ = await contract.cancel(...callD);
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
                const card = {
                    "attribute1": attribute1,
                    "attribute2": attribute2,
                    "attribute3": attribute3,
                    "hashKey": hashKey
                };
                const hashedId = mimcsponge.multiHash([card.attribute1, card.attribute2, card.attribute3, poseidon([card.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

                // The shielding transaction info that is needed to calculate the commitment
                const shield = {
                    id: hashedId,
                    secret: secretKey
                };

                const callD = await shieldCalldata(shield.id, shield.secret);
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
                const zkCards = contract;
                async function buildMerkleTree() {
                    console.log(zkCards.filters);
                    const filter = zkCards.filters.NewCommitment()
                    const events = await zkCards.queryFilter(filter, 0)

                    const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))
                    console.log("Leaves")
                    console.log(leaves)
                    return new Tree(MERKLE_TREE_HEIGHT, leaves)
                }

                let tree = await buildMerkleTree();

                // Note the data for the card we would like to locate its commitment
                const card = {
                    "attribute1": attribute1,
                    "attribute2": attribute2,
                    "attribute3": attribute3,
                    "hashKey": hashKey
                };
                const hashedId = mimcsponge.multiHash([card.attribute1, card.attribute2, card.attribute3, poseidon([card.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

                // The shielding transaction info that is needed to calculate the commitment
                const shield = {
                    id: hashedId,
                    secret: secretKey
                };
                let pubKey = poseidon([shield.secret]).toString();
                let commitment = poseidon([shield.id, pubKey]).toString();
                //console.log(commitment);

                // Find the index of the commitment in the Merkle tree
                let index = tree.indexOf(toFixedHex(commitment))
                //console.log("Index of commitment")
                //console.log(index)

                const input_unshield =
                {
                    id: shield.id,
                    address: address,
                    root: tree.root(),
                    secretKey: secretKey,
                    pathElements: tree.path(index).pathElements.map(x => x.toString()),
                    pathIndices: tree.path(index).pathIndices.map(x => x.toString())
                };
                //console.log(input_transfer)

                let calData = await unshieldCalldata(input_unshield.id, input_unshield.address, input_unshield.root, input_unshield.secretKey, input_unshield.pathElements, input_unshield.pathIndices);
                console.log("calData")
                console.log(calData)


                // {"id":"44","address":"636","root":"163","secret":"3","pathElements":["2","3","3"],"pathIndices":["0","0","1"]}
                //const callD = await unshieldCalldata(shieldId, address, root, secretKey, path_elements, path_indices);
                const callD = calData;
                //const callD = "let there";
                console.log(callD);
                console.log("Call Data");
                console.log(callD);
                console.log("Just before the unshield")
                const response_ = await contract.unshield(...callD);
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
                const zkCards = contract;
                async function buildMerkleTree() {
                    console.log(zkCards.filters);
                    const filter = zkCards.filters.NewCommitment()
                    const events = await zkCards.queryFilter(filter, 0)

                    const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))
                    console.log("Leaves")
                    console.log(leaves)
                    return new Tree(MERKLE_TREE_HEIGHT, leaves)
                }

                let tree = await buildMerkleTree();

                // Note the data for the card we would like to locate its commitment
                const card = {
                    "attribute1": attribute1,
                    "attribute2": attribute2,
                    "attribute3": attribute3,
                    "hashKey": hashKey
                };
                const hashedId = mimcsponge.multiHash([card.attribute1, card.attribute2, card.attribute3, poseidon([card.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

                // The shielding transaction info that is needed to calculate the commitment
                const shield = {
                    id: hashedId,
                    secret: secretKey
                };
                let pubKey = poseidon([shield.secret]).toString();
                let commitment = poseidon([shield.id, pubKey]).toString();
                //console.log(commitment);

                // Find the index of the commitment in the Merkle tree
                let index = tree.indexOf(toFixedHex(commitment))
                //console.log("Index of commitment")
                //console.log(index)

                const input_transfer =
                {
                    id: shield.id,
                    root: tree.root(),
                    secret: shield.secret,
                    pubKeyReceiver: pubKey.toString(),
                    pathElements: tree.path(index).pathElements.map(x => x.toString()),
                    pathIndices: tree.path(index).pathIndices.map(x => x.toString())
                };
                //console.log(input_transfer)
                console.log("PubKey receiver")
                console.log(input_transfer.pubKeyReceiver)

                let calData = await transferCalldata(input_transfer.id, input_transfer.root, input_transfer.secret, input_transfer.pubKeyReceiver, input_transfer.pathElements, input_transfer.pathIndices)
                console.log(calData)
                //transferCalldata(shieldId, root, secretKey,pubKey, path_elements, path_indices)

                //{"id":"33","root":"33","secret":93984,"pubKeyReceiver":"2323","pathElements":["33","44","33"],"pathIndices":["1","1","0"]}
                //const callD = await transferCalldata(shieldId, root, secretKey, pubKey, path_elements, path_indices);
                const callD = calData;
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
    async function handlePubKey() {
        setGeneratedPubKey(poseidon([secretKey_New]).toString());

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
                const zkCards = contract;
                async function buildMerkleTree() {
                    console.log(zkCards.filters);
                    const filter = zkCards.filters.NewCommitment()
                    const events = await zkCards.queryFilter(filter, 0)

                    const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))
                    console.log("Leaves")
                    console.log(leaves)
                    return new Tree(MERKLE_TREE_HEIGHT, leaves)
                }

                let tree = await buildMerkleTree();

                // Note the data for the card we would like to locate its commitment
                const card = {
                    "attribute1": attribute1,
                    "attribute2": attribute2,
                    "attribute3": attribute3,
                    "hashKey": hashKey
                };
                const hashedId = mimcsponge.multiHash([card.attribute1, card.attribute2, card.attribute3, poseidon([card.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

                // The shielding transaction info that is needed to calculate the commitment
                const shield = {
                    id: hashedId,
                    secret: secretKey
                };
                let pubKey = poseidon([shield.secret]).toString();
                let commitment = poseidon([shield.id, pubKey]).toString();
                //console.log(commitment);

                // Find the index of the commitment in the Merkle tree
                let index = tree.indexOf(toFixedHex(commitment))
                //console.log("Index of commitment")
                //console.log(index)

                const input_sell =
                {
                    id: shield.id,
                    root: tree.root(),
                    secret: shield.secret,
                    pubKeyReceiver: pubKey,
                    pathElements: tree.path(index).pathElements.map(x => x.toString()),
                    pathIndices: tree.path(index).pathIndices.map(x => x.toString())
                };
                //console.log(input_transfer)

                let calData = await sellCalldata(input_sell.id, input_sell.root, input_sell.secret, input_sell.pubKeyReceiver, input_sell.pathElements, input_sell.pathIndices, attribute1, attribute2, attribute3, hashKey)

                console.log(calData)


                //{"id":","root":","secret":22,"pubKeyReceiver":""attribute1":2,"attribute2":4,"attribute3":3,"hashKey":88}
                //const callD = await sellCalldata(shieldId, root, secretKey, pubKey, path_elements, path_indices, attribute1, attribute2, attribute3, hashKey);
                const callD = calData;
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
    // Public Key generation logic
    const [secretKey_New, setValueSecretKey_New] = useState('');
    const [generated_pub_key, setGeneratedPubKey] = useState('');

    const handleChangeSecretKey_New = event => {
        const result = event.target.value.replace(/\D/g, '');

        setValueSecretKey_New(result);
    }

    // Bid logic
    const [pubKey_New, setPubKey_new] = useState('');
    const [bidValue, setBidValue] = useState('');

    const handleChangePubKey_New = event => {
        const result = event.target.value.replace(/\D/g, '');

        setPubKey_new(result);
    }
    const handleChangeBidValue = event => {
        const result = event.target.value.replace(/\D/g, '');

        setBidValue(result);
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
                        <h1>Make a bid to purchase a zkCard</h1>
                        <p>Select the combination of attributes that you would like to make a bid for</p>
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
                            <input
                                type="number"
                                placeholder="Your Public Key"
                                value={pubKey_New}
                                onChange={handleChangePubKey_New}
                            />
                        </div>

                        <div>
                            <input
                                type="number"
                                placeholder="Your bid value"
                                value={bidValue}
                                onChange={handleChangeBidValue}
                            />
                        </div>

                        <button onClick={handleBid}>Bid Now</button>
                    </div>

                    <div>
                        <h1>Cancel a bid to purchase a zkCard</h1>
                        <p>Select the combination of attributes that you would like to cancel the bid for</p>
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
                            <input
                                type="number"
                                placeholder="Your Public Key"
                                value={pubKey_New}
                                onChange={handleChangePubKey_New}
                            />
                        </div>
                        <button onClick={handleCancelBid}>Cancel Bid Now</button>
                    </div>

                    <div>
                        <h1>Create a Public Key</h1>
                        <p>Enter a secret number</p>
                        <div>
                            <input
                                type="number"
                                placeholder="Secret key"
                                value={secretKey_New}
                                onChange={handleChangeSecretKey_New}
                            />
                        </div>

                        <button onClick={handlePubKey}>Generate Public Key </button>
                        <p>{generated_pub_key}</p>
                    </div>

                    <div>
                        <h1>Shield your zkCard</h1>
                        <p>Enter the following in order to shield your zkCard:</p>
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


                        <button onClick={handleUnshield}>UnShield Now</button>
                    </div>

                    <div>
                        <h1>Transfer your zkCard</h1>
                        <p>Enter the following in order to transfer your zkCard privately:</p>
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

                        <button onClick={handleTransfer}>Transfer Now</button>
                    </div>

                    <div>
                        <h1>Sell your zkCard</h1>
                        <p>Enter the following in order to sell your zkCard to a public bid:</p>

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

















async function exportCallDataGroth16(input, wasmPath, zkeyPath) {

    const { proof, publicSignals } = await groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
    );
    //console.log("right after fullProve")
    //console.log(proof);
    //console.log(publicSignals);

    const editedPublicSignals = publicSignals;//unstringifyBigInts(publicSignals);
    const editedProof = proof;//unstringifyBigInts(proof);

    //console.log(editedProof);

    const calldata = await groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
    );
    console.log(calldata);
    console.log(calldata[0]);

    const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = [];

    for (let i = 8; i < argv.length; i++) {
        Input.push(argv[i]);
    }

    console.log([a, b, c, Input]);
    return [a, b, c, Input];
}
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");pubKeyReceiver


async function transferCalldata_(shieldId, root, secretKey, pubKey, path_elements, path_indices) {


    const input =
    {
        id: shieldId,
        root: root,
        secret: secretKey,
        pubKeyReceiver: pubKey,
        pathElements: path_elements,
        pathIndices: path_indices
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/transfer/transfer.wasm",
            "./public/zkProofs/transfer/transfer.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}


/** BigNumber to hex string of specified length */
function toFixedHex(number, length = 32) {
    let result =
        '0x' +
        (number instanceof Buffer
            ? number.toString('hex')
            : BigNumber.from(number).toHexString().replace('0x', '')
        ).padStart(length * 2, '0')
    if (result.indexOf('-') > -1) {
        result = '-' + result.replace('-', '')
    }
    return result
}
/*
async function buildMerkleTree(contract) {
    const filter = contract.filters.NewCommitment()
    const events = await contract.queryFilter(filter, 0)

    const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))
    return new Tree(MERKLE_TREE_HEIGHT, leaves)
}*/

/*                      <div>
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
                        */