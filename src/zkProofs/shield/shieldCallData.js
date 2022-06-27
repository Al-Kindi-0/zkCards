import { exportCallDataGroth16 } from "../exportCallData";
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");


export async function shieldCalldata(shieldId, secretKey) {
  
  const input =
  {
  id: shieldId,
  secret: secretKey
  };
  
  //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "zkProofs/shield/shield.wasm",
      "zkProofs/shield/shield.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}
