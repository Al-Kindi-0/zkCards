import { exportCallDataGroth16 } from "../exportCallData";
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");


export async function mintCalldata(attribute1, attribute2, attribute3, hashKey) {
  
  const input =
  {
    attribute1: attribute1,
    attribute2: attribute2,
    attribute3: attribute3,
    hashKey: hashKey 
  };
  
  //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "zkProofs/mint/mint.wasm",
      "zkProofs/mint/mint.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}
