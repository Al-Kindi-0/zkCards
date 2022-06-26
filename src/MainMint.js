import { useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import zkCards from './zkCards.json';
import { mintCalldata } from './mintCallData';
const zkCardsAddress = "0x2de4270093D550F5bAFe462A583eC0b712796aAd";

const MainMint = ({ accounts, setAccounts }) => {
    const [mintAmount, setMintAmount] = useState(1);
    const [attribute1, setAttribute1] = useState();
    const [attribute2, setAttribute2] = useState();
    const [attribute3, setAttribute3] = useState();
    const [hashKey, setHashKey] = useState();

    const isConnected = Boolean(accounts[0]);

    async function handleMint() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                zkCardsAddress,
                zkCards.abi,
                signer
            );
            try {
                const response = await contract.mint(BigNumber(mintAmount));
                const callD = await mintCalldata(attribute1,attribute2,attribute3,hashKey);
                const response_ = await contract.mint(...callD);
                console.log('response:', response);
            } catch (err) {
                console.log("error:", err);
            }
        }
    }

    const handleIncrement = () => {
        if (mintAmount >= 3) return;
        setMintAmount(mintAmount + 1);
    };
    const handleDecrement = () => {
        if (mintAmount <= 1) return;
        setMintAmount(mintAmount - 1);
    };

    return (
        <div>
            <h1>RoboPunksss</h1>
            <p>It's 299999 can you win?</p>
            {isConnected ? (
                <div>
                    <div>
                        <button onClick={handleDecrement}>-</button>
                        <input type="number" value={mintAmount} />
                        <button onClick={handleIncrement}>+</button>
                    </div>
                    <button onClick={handleMint}>Mint Now</button>
                </div>
            ) : (
                <p> You must be connected to Mint</p>

            )}
        </div>
    );
};

export default MainMint;