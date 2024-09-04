export interface CatalystEvent<T> {
  event: string;
  data: T;
}

export interface CatalystQuoteRequestData {
  quoteRequestId: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  expirationTime: string;
  amount: string;
}

interface Input {
  token: string;
  amount: number;
}

interface OutputDescription {
  remoteOracle: string;
  token: string;
  amount: number;
  recipient: string;
  chainId: number;
  remoteCall: string;
}

export interface LimitOrderData {
  proofDeadline: number;
  challengeDeadline: number;
  collateralToken: string;
  fillerCollateralAmount: number;
  challengerCollateralAmount: number;
  localOracle: string;
  inputs: Input[];
  outputs: OutputDescription[];
}

export interface DutchOrderData {
  verificationContext: string;
  verificationContract: string;
  proofDeadline: number;
  challengeDeadline: number;
  collateralToken: string;
  fillerCollateralAmount: number;
  challengerCollateralAmount: number;
  localOracle: string;
  slopeStartingTime: number;
  inputSlopes: string[];
  outputSlopes: string[];
  inputs: Input[];
  outputs: OutputDescription[];
}

// order data is encoded as bytes, we will prob not use but it's here in case
export interface CrossChainOrderEncoded {
  settlementContract: string;
  swapper: string;
  nonce: string;
  originChainId: number;
  initiateDeadline: number;
  fillDeadline: number;
  orderData: string;
}

export interface CrossChainOrder {
  settlementContract: string;
  swapper: string;
  nonce: string;
  originChainId: number;
  initiateDeadline: number;
  fillDeadline: number;
  orderData: DutchOrderData | LimitOrderData;
}

export interface CatalystOrderData {
  orderType: 'LimitOrder' | 'DutchAuction';
  order: CrossChainOrder;
}
