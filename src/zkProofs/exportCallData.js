import { groth16 } from "snarkjs";
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
export async function exportCallDataGroth16(input, wasmPath, zkeyPath) {
  
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