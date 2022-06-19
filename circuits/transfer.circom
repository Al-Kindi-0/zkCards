pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";

include "./merkleTree.circom";

template transfer(levels) {
    signal input id;
    signal input root;
    signal input secret;
    //signal input newSecret;
    signal input pubKeyReceiver;
    signal input pathElements[levels];
    signal input pathIndices[levels];
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

    component newCommitmentHasher = Poseidon(2);
    newCommitmentHasher.inputs[0] <== id;
    newCommitmentHasher.inputs[1] <== pubKeyReceiver;
    newCommitment <== newCommitmentHasher.out;

    component nullifierHasher = MiMCSponge(2, 220, 1);
    nullifierHasher.ins[0] <== id;
    nullifierHasher.ins[1] <== secret;
    nullifierHasher.k <== 0;
    nullifier <== nullifierHasher.outs[0];
}


component main {public [root]}= transfer(3);