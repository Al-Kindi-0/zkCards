


const { wtns, groth16 } = require('snarkjs')
const { utils } = require('ffjavascript')

const fs = require('fs')
const tmp = require('tmp-promise')
const util = require('util')
const exec = util.promisify(require('child_process').exec)



async function prove(input, keyBasePath) {
    const { proof } = await groth16.fullProve(
      utils.stringifyBigInts(input),
      `${keyBasePath}.wasm`,
      `${keyBasePath}.zkey`,
    )
    return (
      '0x' +
      toFixedHex(proof.pi_a[0]).slice(2) +
      toFixedHex(proof.pi_a[1]).slice(2) +
      toFixedHex(proof.pi_b[0][1]).slice(2) +
      toFixedHex(proof.pi_b[0][0]).slice(2) +
      toFixedHex(proof.pi_b[1][1]).slice(2) +
      toFixedHex(proof.pi_b[1][0]).slice(2) +
      toFixedHex(proof.pi_c[0]).slice(2) +
      toFixedHex(proof.pi_c[1]).slice(2)
    )
  }

  /** BigNumber to hex string of specified length */
function toFixedHex(number, length = 32) {
  let result =
    '0x' +
    (number instanceof Buffer
      ? number.toString('hex')
      : BigNumber.from(number).toHexString().replace('0x', '')
    ).padStart(length * 2, '0')
  if (result.indexOf('-') > -1) {
    result = '-' + result.replace('-', '')
  }
  return result
}