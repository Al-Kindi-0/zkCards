const { groth16 } =require("snarkjs");
//const bigInt = require('big-integer');


/*
const unstringifyBigInts = (o) => {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o)
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts)
    } else if (typeof o == "object") {
        const res = {}
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k])
        }
        return res
    } else {
        return o
    }
}
*/

/* global BigInt */
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


async function transferCalldata(shieldId, root, secretKey,pubKey, path_elements, path_indices) {
  
  
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
      "./src/zkProofs/transfer/transfer.wasm",
      "./src/zkProofs/transfer/transfer.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}
