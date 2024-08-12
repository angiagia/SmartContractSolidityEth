import Web3 from 'web3';
import fs from 'fs';
import path from 'path';

// Tạo kiểu dữ liệu cho contract ABI và config
interface ContractFile {
    abi: any[];
    bytecode: string;
}

interface Config {
    ethPrice: number;
    btcPrice: number;
    bnbPrice: number;
}

// Khởi tạo Web3
const web3 = new Web3(Web3.givenProvider || 'https://127.0.0.1:7545');

// Đọc ABI và Bytecode
const contractFile: ContractFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../build/contracts/EthMarketPlace.json'), 'utf8')
);
const contractABI = contractFile.abi;
const contractBytecode = contractFile.bytecode;

// Đọc giá trị từ config.json
const config: Config = JSON.parse(fs.readFileSync('configPrice.json', 'utf8'));
const { ethPrice, btcPrice, bnbPrice } = config;

// Triển khai hợp đồng
// @ts-ignore
const deployContract = async (): Promise<Web3.Contract> => {
    const accounts = await web3.eth.getAccounts();
    const EthMarketplace = new web3.eth.Contract(contractABI);

    const deployedContract = await EthMarketplace.deploy({
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
};

// Tương tác với hợp đồng

// @ts-ignore
const interactWithContract = async (contract: Web3.Contract): Promise<void> => {
    const accounts = await web3.eth.getAccounts();

    // Set ETH, BTC, BNB Prices (Optional, only owner)
    await contract.methods.setPrices(ethPrice, btcPrice, bnbPrice).send({ from: accounts[0] });

    // Mua ETH
    await contract.methods.buy(0).send({
        from: accounts[1],
        value: web3.utils.toWei('1', 'ether')
    });

    // Bán ETH
    await contract.methods.sell(0, 1).send({
        from: accounts[1]
    });

    // Mua BTC
    await contract.methods.buy(1).send({
        from: accounts[1],
        value: web3.utils.toWei('0.1', 'ether')
    });

    // Bán BTC
    await contract.methods.sell(1, 1).send({
        from: accounts[1]
    });

    // Mua BNB
    await contract.methods.buy(2).send({
        from: accounts[1],
        value: web3.utils.toWei('0.05', 'ether')
    });

    // Bán BNB
    await contract.methods.sell(2, 1).send({
        from: accounts[1]
    });

    // Rút tiền từ hợp đồng (chỉ có chủ sở hữu mới được phép)
    await contract.methods.withdraw().send({ from: accounts[0] });
};

// Triển khai và tương tác với hợp đồng
deployContract().then(contract => interactWithContract(contract));
