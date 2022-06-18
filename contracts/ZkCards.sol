pragma solidity ^0.8.0;

import "./MerkleTreeWithHistory.sol";
import "hardhat/console.sol";
import "./Verifier.sol";
//import "./MintVerifier.sol";
//import "./ShieldVerifier.sol";
//import "./UnshieldVerifier.sol";
//import "./TransferVerifier.sol";


interface IVerifier {
    function verifyMintProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external returns (bool);

    function verifyShieldProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) external returns (bool);

    function verifyUnshieldProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata input
    ) external returns (bool);

    function verifyTransferProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external returns (bool);
}

contract ZkCards is MerkleTreeWithHistory {
    event Statue(uint256 id);

    IVerifier public verifier;

    //MintVerifier public mintVerifier;
    //TransferVerifier public transferVerifier;
    //ShieldVerifier public shieldVerifier;
    //UnshieldVerifier public unshieldVerifier;

    mapping(uint256 => address) public ownerOf;

    // 0: not minted, 1: minted, 2: shielded
    mapping(uint256 => uint8) public status;

    // not strictly necessary, but it doesn't hurt to double-check
    mapping(uint256 => bool) public commitments;

    mapping(uint256 => bool) public nullifiers;

    constructor(
        IVerifier _verifier,
        //MintVerifier _mintVerifier,
        uint32 levels,
        address hasher
    ) MerkleTreeWithHistory(levels, IHasher(hasher)) {
        verifier = _verifier;
        //mintVerifier = _mintVerifier;
    }
    function mint(
        //uint256 id,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public {
        //_mint(id, msg.sender, a, b, c, input);
        _mint(input[0], msg.sender, a, b, c, input);
    }

    function mintTo(
        uint256 id,
        address recipient,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public {
        _mint(id, recipient, a, b, c, input);
    }

    function _mint(
        uint256 id,
        address recipient,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) private {
        require(status[id] == 0, "Token already minted");
        //require(mintVerifier.verifyProof(a, b, c, input), "Failure of proof of mint verification");
        require(verifier.verifyMintProof(a, b, c, input), "Failure of proof of mint verification");
        status[id] = 1;
        ownerOf[id] = recipient;
    }

    function shield(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public {
        uint256 commitment = input[0];
        uint256 id = input[1];

        emit Statue(id);
        console.log(id);
        require(
            status[id] == 1,
            "Only minted and unshielded tokens can be shielded"
        );
        require(ownerOf[id] == msg.sender, "Only owner can shield a token");
        require(!commitments[commitment], "Commitment already exists");
        require(
            verifier.verifyShieldProof(a, b, c, input),
            "Invalid shield proof"
        );

        _insert(bytes32(commitment));
        commitments[commitment] = true;
        ownerOf[id] = address(this);
    }

    function unshield(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input
    ) public {
        uint256 nullifier = input[0];
        uint256 id = input[1];
        uint256 ownerUint = input[2];
        uint256 root = input[3];
        address owner = address(uint160(ownerUint));

        require(!nullifiers[nullifier], "Nullifier was already used");
        nullifiers[nullifier] = true;
        require(isKnownRoot(bytes32(root)), "Cannot find your merkle root");

        require(
            verifier.verifyUnshieldProof(a, b, c, input),
            "Invalid unshield proof"
        );

        ownerOf[id] = owner;
        status[id] = 1;
    }

    function transfer(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) public {
        uint256 nullifier = input[0];
        uint256 newCommitment = input[1];
        uint256 root = input[2];

        require(!nullifiers[nullifier], "Nullifier was already used");

        require(isKnownRoot(bytes32(root)), "Cannot find your merkle root");

        require(
            verifier.verifyTransferProof(a, b, c, input),
            "Invalid unshield proof"
        );

        nullifiers[nullifier] = true;
        require(!commitments[newCommitment], "Commitment already exists");
        _insert(bytes32(newCommitment));
        commitments[newCommitment] = true;
    }


    function sell(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input
    ) public {
        uint256 nullifier = input[0];
        uint256 newCommitment = input[1];
        uint256 root = input[2];
        uint256 pubKeyReceiver = input[3];

        // Check that pubKeyReceiver has made an ask and that the has not been matched yet.


        require(!nullifiers[nullifier], "Nullifier was already used");


        require(isKnownRoot(bytes32(root)), "Cannot find your merkle root");

        // Verify that the seller has indeed made a shielded transfer to pubKeyReceiver and that the conditions
        // of the sell are satisfied.
       // require(
           // verifier.verifyTransferProof(a, b, c, input),
        //    "Invalid unshield proof"
       // );

        nullifiers[nullifier] = true;
        require(!commitments[newCommitment], "Commitment already exists");
        _insert(bytes32(newCommitment));
        commitments[newCommitment] = true;
    }
}
