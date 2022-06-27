import { exportCallDataGroth16 } from "../exportCallData";
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");

//unshieldCalldata(shieldId, address, root, secretKey, path_elements, path_indices)
export async function unshieldCalldata(shieldId, address, root, secretKey, path_elements, path_indices) {
  /*  {"id":"4045961312564838524584312951743669798304780675057366043640632796737178636160",
      "address":"642829559307850963015472508762062935916233390536",
      "root":"1690708511757659227742357340569596455971163410596220446748329952335796246649",
      "secret":3393984,
      "pathElements":["21663839004416932945382355908790599225266501822907911457504978515578255421292",
          "16923532097304556005972200564242292693309333953544141029519619077135960040221",
          "19183841282617141492345255333700857372590122418569020304786266069100549695638"],
          "pathIndices":["0","0","1"]}
    */
  const input =
  {
    id: shieldId,
    address: address,
    root: root,
    secret: secretKey,
    pathElements: path_elements,
    pathIndices: path_indices
  };

  //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "zkProofs/unshield/unshield.wasm",
      "zkProofs/unshield/unshield.zkey"
    );
  } catch (error) {
    console.log(error);
    //window.alert("Wrong answer");
  }

  return dataResult;
}
