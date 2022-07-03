
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";

include "./merkleTree.circom";

template sell(levels) {
    signal input id;
    signal input root;
    signal input secret;
    signal input pubKeyReceiver;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input attribute1;
    signal input attribute2;
    signal input attribute3;
    signal input hashKey;
    signal input address; // Needed to stop front-running 
    signal output nullifier;
    signal output newCommitment;

    component genPubKey = Poseidon(1);
    genPubKey.inputs[0] <== secret;

    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== id;
    commitmentHasher.inputs[1] <== genPubKey.out;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitmentHasher.out;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
    tree.root <== root;


    component genPubKeyOriginal = Poseidon(1);
    genPubKeyOriginal.inputs[0] <== hashKey;
    
    component mimc = MiMCSponge(4, 220, 1);
    mimc.ins[0] <== attribute1;
    mimc.ins[1] <== attribute2;
    mimc.ins[2] <== attribute3;
    mimc.ins[3] <== genPubKeyOriginal.out;

    mimc.k <== 0;

    id === mimc.outs[0];

    component mimc_new= MiMCSponge(4, 220, 1);

    mimc_new.ins[0] <== attribute1;
    mimc_new.ins[1] <== attribute2;
    mimc_new.ins[2] <== attribute3;
    mimc_new.ins[3] <== pubKeyReceiver;

    mimc_new.k <== 0;

    component newCommitmentHasher = Poseidon(2);
    newCommitmentHasher.inputs[0] <== mimc_new.outs[0];
    newCommitmentHasher.inputs[1] <== pubKeyReceiver;
    newCommitment <== newCommitmentHasher.out;

    component nullifierHasher = MiMCSponge(2, 220, 1);
    nullifierHasher.ins[0] <== id;
    nullifierHasher.ins[1] <== secret;
    nullifierHasher.k <== 0;
    nullifier <== nullifierHasher.outs[0];

    signal square;

    square <== address * address;
}


component main {public [address, root, pubKeyReceiver, attribute1, attribute2, attribute3]}= sell(3);