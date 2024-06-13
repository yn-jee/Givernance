require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: "0.8.0",
    networks: {
        sepolia: {
            url: "https://ethereum-sepolia-rpc.allthatnode.com/5wQs7Uvn5x8zQex2Cq2G8BJW2MU87gTJ",
            accounts: ["abfc0069669579a2a6506570de29d71866da20e1f9dc778528fbd6cd15be7d49"],
        },
    },
};