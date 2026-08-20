import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  OrderCreated,
  OrderCancelled,
  OrderMatched,
  OrderFilled,
  OrderPartiallyFilled,
  ProtocolFeeUpdated,
  OwnershipTransferred,
  Paused,
  Unpaused,
} from "../generated/WindmillExchange/WindmillExchange"
import {
  Order,
  Settlement,
  Pair,
  User,
  Protocol,
} from "../generated/schema"

function getOrCreateProtocol(): Protocol {
  let protocol = Protocol.load("1")
  if (!protocol) {
    protocol = new Protocol("1")
    protocol.paused = false
    protocol.save()
  }
  return protocol!
}

function getOrCreateUser(address: string): User {
  let user = User.load(address)
  if (!user) {
    user = new User(address)
    user.orderCount = 0
    user.save()
  }
  return user!
}

function getOrCreatePair(tokenA: string, tokenB: string): Pair {
  let t0 = tokenA
  let t1 = tokenB
  if (t0 > t1) {
    t0 = tokenB
    t1 = tokenA
  }
  let pairId = t0.concat("-").concat(t1)
  let pair = Pair.load(pairId)
  if (!pair) {
    pair = new Pair(pairId)
    pair.tokenA = Bytes.fromHexString(t0)
    pair.tokenB = Bytes.fromHexString(t1)
    pair.volume = BigInt.fromI32(0)
    pair.orderCount = 0
    pair.save()
  }
  return pair!
}

export function handleOrderCreated(event: OrderCreated): void {
  let params = event.params
  let orderId = params.orderId.toString()

  let pair = getOrCreatePair(
    params.tokenIn.toHexString(),
    params.tokenOut.toHexString()
  )
  let user = getOrCreateUser(params.maker.toHexString())

  let order = new Order(orderId)
  order.orderId = params.orderId
  order.maker = params.maker
  order.isBuy = params.isBuy
  order.active = true
  order.tokenIn = params.tokenIn
  order.tokenOut = params.tokenOut
  order.amountIn = params.amountIn
  order.remainingIn = params.amountIn
  order.startPrice = BigInt.fromI32(0)
  order.slope = BigInt.fromI32(0)
  order.minPrice = BigInt.fromI32(0)
  order.maxPrice = BigInt.fromI32(0)
  order.createdAt = event.block.timestamp
  order.expiry = BigInt.fromI32(0)
  order.pair = pair.id
  order.user = user.id
  order.save()

  pair.orderCount += 1
  pair.save()

  user.orderCount += 1
  user.save()
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    order.active = false
    order.save()
  }
}

export function handleOrderMatched(event: OrderMatched): void {
  let params = event.params
  let settlementId = params.buyOrderId
    .toString()
    .concat("-")
    .concat(params.sellOrderId.toString())
    .concat("-")
    .concat(event.block.timestamp.toString())

  let settlement = new Settlement(settlementId)
  settlement.buyOrder = params.buyOrderId.toString()
  settlement.sellOrder = params.sellOrderId.toString()
  settlement.keeper = params.keeper
  settlement.settlementPrice = params.settlementPrice
  settlement.executedQuantity = params.executedQuantity
  settlement.timestamp = event.block.timestamp
  settlement.save()

  let buyOrder = Order.load(params.buyOrderId.toString())
  if (buyOrder) {
    let pair = Pair.load(buyOrder.pair)
    if (pair) {
      pair.volume = pair.volume.plus(params.executedQuantity)
      pair.save()
    }
  }
}

export function handleOrderFilled(event: OrderFilled): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    order.active = false
    order.save()
  }
}

export function handleOrderPartiallyFilled(event: OrderPartiallyFilled): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    order.remainingIn = event.params.remainingIn
    order.save()
  }
}

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdated): void {
  let protocol = getOrCreateProtocol()
  protocol.treasury = event.params.treasury
  protocol.protocolFeeBps = event.params.protocolFeeBps
  protocol.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let protocol = getOrCreateProtocol()
  protocol.owner = event.params.newOwner
  protocol.save()
}

export function handlePaused(event: Paused): void {
  let protocol = getOrCreateProtocol()
  protocol.paused = true
  protocol.save()
}

export function handleUnpaused(event: Unpaused): void {
  let protocol = getOrCreateProtocol()
  protocol.paused = false
  protocol.save()
}
