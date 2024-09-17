export const toEth = (val: number | bigint | string, decimals = 6): number => {
  const wei = BigInt(val.toString())
  const mul = 10 ** decimals
  return Number((wei * BigInt(mul)) / 1000000000000000000n) / mul
}

export const toEthDisplay = (val: number | bigint | string): string =>
  toEth(val).toLocaleString()

export const toWei = (val: number | bigint | string): string => {
  let eth: bigint
  if (typeof val !== 'bigint') {
    eth = BigInt(val.toString())
  } else {
    eth = val
  }
  return (eth * 1000000000000000000n).toString()
}
