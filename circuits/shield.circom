pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/poseidon.circom";

template shield() {
    signal input id;
    signal input secret;
    signal output commitment;

    component genPubKey = Poseidon(1);
    genPubKey.inputs[0] <== secret;

    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== id;
    commitmentHasher.inputs[1] <== genPubKey.out;

    commitment <== commitmentHasher.out;
}


component main {public [id]} = shield();