const { Web3 } = require("web3");
const NODE_URL = "wss://mainnet.infura.io/ws/v3/297bd5e1cfef49b1bf73a90071c7b5da";
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
const SWAP_EXACT_ETH_FOR_TOKEN_SIGNATURE = "0x7ff36ab5";
const SWAP_EXACT_ETH_FOR_FEE_TOKEN_SIGNATURE = "0xb6f9de95";

const provider = new Web3.providers.WebsocketProvider(
  "wss://mainnet.infura.io/ws/v3/297bd5e1cfef49b1bf73a90071c7b5da",
  {
      clientConfig: {
          keepalive: true,
          keepaliveInterval: 60000
      },
      reconnect: {
          auto: true,
          delay: 5000,
          maxAttempts: 5,
          onTimeout: false
      }
  }
);
provider.on('connect', () => {
  console.log("Websocket connected.");
});
provider.on('close', (event) => {
  console.log(event);
  console.log("Websocket closed.");
});
provider.on('error', (error) => {
  console.error(error);
});

const web3 = new Web3(provider);
web3.eth.net.isListening().then((response)=>{
  if (response === true){
    console.log("Hoang check connect ", response);
    monitorNewBlock();
  }
})

async function monitorNewBlock(){
  const subscription = await web3.eth.subscribe('newBlockHeaders');
  subscription.on('data', async (blockHeader)=>{
    console.log('Get new block number', blockHeader.number);
    const block = await web3.eth.getBlock(blockHeader.number, true);
    // console.log("Hoang check block ne ", block);
    block.transactions.forEach((trx)=>{
      if (trx.to && trx.to.toLowerCase() === UNISWAP_ROUTER_ADDRESS){
        if (trx.input && (trx.input.startsWith(SWAP_EXACT_ETH_FOR_TOKEN_SIGNATURE) || trx.input.startsWith(SWAP_EXACT_ETH_FOR_FEE_TOKEN_SIGNATURE))){
          console.log("Hash: ", trx.hash);
          console.log("From: ", trx.from);
          console.log("Value: ", web3.utils.fromWei(trx.value, "ether"), " ETH");
          console.log("Input: ", trx.input);
        }
        // console.log('Hoang check trx', trx);
      }
    });
  });
}
