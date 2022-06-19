pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template hashCharacter() {
    signal input attribute[3];
    signal input pubKey;
    signal output out;

    component mimc = MiMCSponge(4, 220, 1);
    mimc.ins[0] <== attribute[0];
    mimc.ins[1] <== attribute[1];
    mimc.ins[2] <== attribute[2];
    mimc.ins[3] <== pubKey;

    mimc.k <== 0;

    out <== mimc.outs[0];
}

template mint(TOTAL) {
    signal input attribute1;
    signal input attribute2;
    signal input attribute3;
    signal input hashKey;

    signal output out; 

    component lowerbound[3];
    component upperbound[3];

    var attributes[3] = [attribute1,attribute2,attribute3];


    for(var i = 0; i < 3; i++) {
        lowerbound[i] = GreaterEqThan(32);
        lowerbound[i].in[0] <== attributes[i];
        lowerbound[i].in[1] <== 0;

        upperbound[i] = LessEqThan(32);
        upperbound[i].in[0] <== attributes[i];
        upperbound[i].in[1] <== 10;

        lowerbound[i].out === upperbound[i].out;
    }
    
    
    
    component sum_total = LessEqThan(32);
    sum_total.in[0] <== attribute1 + attribute2 + attribute3;
    sum_total.in[1] <== TOTAL;

    sum_total.out === 1;

    component genPubKey = Poseidon(1);
    genPubKey.inputs[0] <== hashKey;

    component cHash = hashCharacter();
    cHash.attribute[0] <== attribute1;
    cHash.attribute[1] <== attribute2;
    cHash.attribute[2] <== attribute3;
    cHash.pubKey <== genPubKey.out;

    out <== cHash.out;
}
component main = mint(10);