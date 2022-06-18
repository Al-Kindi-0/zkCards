pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimcsponge.circom";

/*

template hashLayer(depth){
    var numElem = 1 << (depth);
    signal input ins[numElem*2];
    signal output outs[numElem];
    
    component hasher[numElem];
    for(var i = 0; i < numElem; i++){
        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== ins[2*i];
        hasher[i].inputs[1] <== ins[2*i + 1];
        outs[i] <== hasher[i].out;
    }
}

template CheckRoot(n) { // compute the root of a MerkleTree of n Levels 
    signal input leaves[2**n];
    signal output root;
    component hashlayer[n];
    //[assignment] insert your code here to calculate the Merkle root from 2^n leaves
    for(var i = n - 1; i >= 0; i--){
        hashlayer[i] = hashLayer(1<<n);
        for(var j = 0; j < (1<<(n+1)); j++){
            hashlayer[i].ins[j] <== (i == n)? leaves[j] : hashlayer[i + 1].outs[j];
        }
    }

    root <== (n > 0) ? hashlayer[0].outs[0] : leaves[0];
}

template mux2(){
    signal input i;
    signal input A;
    signal input B;
    signal output A_out;
    signal output B_out;

    signal tmp;
    tmp <== (B - A)*i;
    A_out <== tmp + A;
    B_out <== -tmp + B;
}

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template MerkleTreeChecker(n) {
    
    signal input leaf;
    signal input path_elements[n];
    signal input path_index[n]; // path index are 0's and 1's indicating whether the current element is on the left or right
    signal output root; // note that this is an OUTPUT signal

    component multiplexors[n];
    component hasher[n];

    for(var i = 0; i < n; i++){
        multiplexors[i] = mux2();
        multiplexors[i].A <== (i==0) ? leaf : hasher[i-1].out;
        multiplexors[i].B <== path_elements[i];
        multiplexors[i].i <== path_index[i];

        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== multiplexors[i].A_out;
        hasher[i].inputs[1] <== multiplexors[i].B_out;

    }

    root <== hasher[n-1].out;
}

*/

// Computes MiMC([left, right])
template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = MiMCSponge(2, 220, 1);
    hasher.ins[0] <== left;
    hasher.ins[1] <== right;
    hasher.k <== 0;
    hash <== hasher.outs[0];
}

// if s == 0 returns [in[0], in[1]]
// if s == 1 returns [in[1], in[0]]
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component selectors[levels];
    component hashers[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    root === hashers[levels - 1].hash;
}