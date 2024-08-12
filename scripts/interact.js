"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Khởi tạo Web3
const web3 = new web3_1.default(web3_1.default.givenProvider || 'https://127.0.0.1:7545');
// Đọc ABI và Bytecode
const contractFile = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../build/contracts/EthMarketPlace.json'), 'utf8'));
const contractABI = contractFile.abi;
const contractBytecode = contractFile.bytecode;
// Đọc giá trị từ config.json
const config = JSON.parse(fs_1.default.readFileSync('configPrice.json', 'utf8'));
const { ethPrice, btcPrice, bnbPrice } = config;
// Triển khai hợp đồng
// @ts-ignore
const deployContract = () => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield web3.eth.getAccounts();
    const EthMarketplace = new web3.eth.Contract(contractABI);
    const deployedContract = yield EthMarketplace.deploy({
        data: contractBytecode,
        arguments: [ethPrice, btcPrice, bnbPrice]
    })
        .send({
        from: accounts[0],
        gas: "1500000",
        gasPrice: '30000000000'
    });
    console.log('Contract deployed at address:', deployedContract.options.address);
    return deployedContract;
});
// Tương tác với hợp đồng
// @ts-ignore
const interactWithContract = (contract) => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield web3.eth.getAccounts();
    // Set ETH, BTC, BNB Prices (Optional, only owner)
    yield contract.methods.setPrices(ethPrice, btcPrice, bnbPrice).send({ from: accounts[0] });
    // Mua ETH
    yield contract.methods.buy(0).send({
        from: accounts[1],
        value: web3.utils.toWei('1', 'ether')
    });
    // Bán ETH
    yield contract.methods.sell(0, 1).send({
        from: accounts[1]
    });
    // Mua BTC
    yield contract.methods.buy(1).send({
        from: accounts[1],
        value: web3.utils.toWei('0.1', 'ether')
    });
    // Bán BTC
    yield contract.methods.sell(1, 1).send({
        from: accounts[1]
    });
    // Mua BNB
    yield contract.methods.buy(2).send({
        from: accounts[1],
        value: web3.utils.toWei('0.05', 'ether')
    });
    // Bán BNB
    yield contract.methods.sell(2, 1).send({
        from: accounts[1]
    });
    // Rút tiền từ hợp đồng (chỉ có chủ sở hữu mới được phép)
    yield contract.methods.withdraw().send({ from: accounts[0] });
});
// Triển khai và tương tác với hợp đồng
deployContract().then(contract => interactWithContract(contract));
