import { initiateOrder } from 'src/execution/order.initiate';
import { CatalystOrderData } from '../types';
import { WebSocket } from 'ws';
import { BaseReactor__factory } from 'lib/contracts';
import { ethers } from 'ethers';
import { OrderKey } from 'src/types/order-key.types';
import { fillOutputs } from 'src/execution/order.fill';

export async function handleReceiveOrder(
  orderRequest: CatalystOrderData,
  ws: WebSocket,
) {
  console.log('Received order:', orderRequest);
  // TODO: some kind of evaluation of if the price is right.
  const signature = orderRequest.signature;
  const order = orderRequest.order;
  // TODO: Correct type casting.
  const transactionResponse = await initiateOrder(order, signature);
  console.log({ hash: transactionResponse.hash });

  const transactionReceipt = await transactionResponse.wait(2);

  // Probably the better way to do this is to look for the initiate events
  // Check if it was us and then fill. It is simpler to just check if the transaction went through.
  if (transactionReceipt.status === 0) return;

  // We need the actual orderKey. (The one provided in the call is just an estimate.)
  const logs = transactionReceipt.logs;
  // Get the orderInitiated event.
  let orderKeyLog: ethers.Log;
  for (const log of logs) {
    if (log.address !== order.settlementContract) continue;
    if (
      log.topics[0] !==
      '0x068f390a186ab224f3ad01f21c41b507b6c4e715dcfd2e640ce83b784071eb3f'
    )
      continue;
    orderKeyLog = log; // TODO: Parse log.data.
  }
  if (orderKeyLog === undefined)
    throw Error(
      `Tx ${transactionResponse.hash} was initiated and status !== 0, but couldn't find OrderInitiated event in logs`,
    );
  const reactorInterface = BaseReactor__factory.createInterface();
  const parsedLog = reactorInterface.decodeEventLog(
    'OrderInitiated',
    orderKeyLog.data,
  );
  const orderKey = parsedLog.orderKey as OrderKey;

  fillOutputs(orderKey);

  // TODO: remove :)
  // ws.send(`Thanks dude, you may want this: ${transactionResponse.hash}`);
}
