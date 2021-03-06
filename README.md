zkCards is a dApp that allows users to mint a magic card with a unique id and set of attributes. The minting happens in a private manner using zero-knowledge proofs. This allows the minter to hide the set of attributes and thus change the market dynamics from a supply-and-demand one to one where the skills of the player (can also be luck) and the progression of the game (e.g. certain attribute might become more valuable at a later stage of the game) are the main factors in determining the clearing price of a card.
Due to the need to reveal the attributes to finalize the transfer, there is a potential shortcoming in the form of loss of value for the entity purchasing the card. To overcome this, we have added an implementation of a shielded-pool similar in design to Sapling with an implementation based on the TornadoCash Nova one. Using the shielded-pool, the new owner can re-shield the purchased card by sending it to a new public key that she controls. The shielded-pool implementation relies heavily on zero-knowledge techniques.


<!-- The project is currently on [Goerli Testnet](https://goerli.etherscan.io/address/0x2de4270093d550f5bafe462a583ec0b712796aad#code) -->

The project is currently on [Goerli Mainnet](https://goerli.etherscan.io/address/0x2de4270093d550f5bafe462a583ec0b712796aad#code) .




## Project Structure

The project has three main folders:

- circuits
- contracts
- src

### circuits

The [circuits folder](/circuits/) contains all the circuits used in zkCards.

Each functionality has a specific circuit written in circom v2 for the Groth16 proving system. These are the circuits we have:
- Mint: Takes a list of 3 attributes that sum to 10 and a secret key that gives the minter ownership of the zkCard.
- Shield: Takes a zkCard spesified by its unique id and shields it so that its owner is hidden from the public.
- Transfer: Takes a zkCard id, the secret used to generate it and a zero-knowledge proof attesting to the fact the person initiating the transfer indeed ownes a zkCard that was already shielded at some point in the past. Neither the sender nor the receiver are known (provided relayers are used, which is to be implemented in the future).
- Unshield: This is the inverse of the shield operation and it takes also a zero-knowledge proof attesting to the fact the person initiation the unshield transaction indeed owns a zkCard that is inside the shielded pool.
- Sell: This implements the functionality of transfering the ownership from a bidder who posts a bid to the main smart contract. The bid inludes the attributes that the bidder is seeking to acquire as well as the price she is willing to pay for them. The sell circuit implements the proof showing that the person responding to the bid indeed owns a zkCard with the requested the set of attributes. Moreover, the proof attests to the fact the seller has done its work, in a correct manner, in order to transfer the ownership of the zkCard inside the shielded pool to the public key of the bidder. One very nice thing about the sell functionality, is that it can implement a transaction logic based on a rich class of functions of the attributes. This is because the main check happens outside of the circuit and inside of the smart-contract, hence this affors more flexiblity to do more interesting things down the line.

### contracts

The [contracts folder](/contracts/) contains all the smart contracts used in zkCards.

There are 3 contract:
- zkCards.sol: This is the main contract and it implement the main logic of the dApp. It manages the minted zkCards as well as the shielded pool. It also implements a basic market-place for making bids and accepting them.
- Verifier.sol: This contract contains the verifiers correspoing to each of the aforementied contracts. The verfication logic is the same (3 pairings) but each circuit has its own verification key.
- MerkleTreeWithHistory.sol: This is the contract the implements the logic of the shielded pool, it does so via Merkle trees for both commitments (more expressively notes of ownership) and nullifiers (of notes of ownership). The contract is taken as is from the TornadoCash repo.


### src

The [src folder](/src/) contains the zkCards frontend.

We implement a very basic from end using react-app.