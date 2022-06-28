const { exportCallDataGroth16 } = require("../exportCallData");
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");pubKeyReceiver


export async function transferCalldata(shieldId, root, secretKey,pubKey, path_elements, path_indices) {
  
  
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
      "zkProofs/transfer/transfer.wasm",
      "zkProofs/transfer/transfer.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}

