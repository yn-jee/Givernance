const GiversTokenABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "CheckpointUnorderedInsertion",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "increasedSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "cap",
				"type": "uint256"
			}
		],
		"name": "ERC20ExceededSafeSupply",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "ERC2612ExpiredSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "signer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC2612InvalidSigner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			},
			{
				"internalType": "uint48",
				"name": "clock",
				"type": "uint48"
			}
		],
		"name": "ERC5805FutureLookup",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ERC6372InconsistentClock",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentNonce",
				"type": "uint256"
			}
		],
		"name": "InvalidAccountNonce",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidShortString",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "bits",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "SafeCastOverflowedUintDowncast",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "str",
				"type": "string"
			}
		],
		"name": "StringTooLong",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expiry",
				"type": "uint256"
			}
		],
		"name": "VotesExpiredSignature",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "delegator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "fromDelegate",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "toDelegate",
				"type": "address"
			}
		],
		"name": "DelegateChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "delegate",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "previousVotes",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newVotes",
				"type": "uint256"
			}
		],
		"name": "DelegateVotesChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "EIP712DomainChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "CLOCK_MODE",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DOMAIN_SEPARATOR",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "burnFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint32",
				"name": "pos",
				"type": "uint32"
			}
		],
		"name": "checkpoints",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint48",
						"name": "_key",
						"type": "uint48"
					},
					{
						"internalType": "uint208",
						"name": "_value",
						"type": "uint208"
					}
				],
				"internalType": "struct Checkpoints.Checkpoint208",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "clock",
		"outputs": [
			{
				"internalType": "uint48",
				"name": "",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			}
		],
		"name": "delegate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "nonce",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiry",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "delegateBySig",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "delegates",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eip712Domain",
		"outputs": [
			{
				"internalType": "bytes1",
				"name": "fields",
				"type": "bytes1"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "version",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "verifyingContract",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "salt",
				"type": "bytes32"
			},
			{
				"internalType": "uint256[]",
				"name": "extensions",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			}
		],
		"name": "getPastTotalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			}
		],
		"name": "getPastVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "getVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "nonces",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "numCheckpoints",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "permit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const GiversTokenBytecode = "610160604052348015610010575f80fd5b5060405161233e38038061233e83398101604081905261002f9161027d565b6040518060400160405280600b81526020016a23b4bb32b939aa37b5b2b760a91b81525080604051806040016040528060018152602001603160f81b815250836040518060400160405280600b81526020016a23b4bb32b939aa37b5b2b760a91b8152506040518060400160405280600381526020016247544b60e81b81525081600390816100be9190610342565b5060046100cb8282610342565b5050506001600160a01b0381166100fc57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b610105816101bd565b5061011182600661020e565b6101205261012081600761020e565b61014052815160208084019190912060e052815190820120610100524660a0526101ac60e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b60805250503060c052506104599050565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b5f6020835110156102295761022283610240565b905061023a565b816102348482610342565b5060ff90505b92915050565b5f80829050601f8151111561026a578260405163305a27a960e01b81526004016100f39190610401565b805161027582610436565b179392505050565b5f6020828403121561028d575f80fd5b81516001600160a01b03811681146102a3575f80fd5b9392505050565b634e487b7160e01b5f52604160045260245ffd5b600181811c908216806102d257607f821691505b6020821081036102f057634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561033d57805f5260205f20601f840160051c8101602085101561031b5750805b601f840160051c820191505b8181101561033a575f8155600101610327565b50505b505050565b81516001600160401b0381111561035b5761035b6102aa565b61036f8161036984546102be565b846102f6565b602080601f8311600181146103a2575f841561038b5750858301515b5f19600386901b1c1916600185901b1785556103f9565b5f85815260208120601f198616915b828110156103d0578886015182559484019460019091019084016103b1565b50858210156103ed57878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b805160208083015191908110156102f0575f1960209190910360031b1b16919050565b60805160a05160c05160e051610100516101205161014051611e946104aa5f395f610daf01525f610d8201525f610aa801525f610a8001525f6109db01525f610a0501525f610a2f0152611e945ff3fe608060405234801561000f575f80fd5b506004361061015d575f3560e01c806306fdde0314610161578063095ea7b31461017f57806318160ddd146101a257806323b872dd146101b4578063313ce567146101c75780633644e515146101d65780633a46b1a8146101de57806340c10f19146101f157806342966c68146102065780634bf5d7e914610219578063587cde1e146102435780635c19a95c146102635780636fcfff451461027657806370a082311461029e578063715018a6146102b157806379cc6790146102b95780637ecebe00146102cc57806384b0196e146102df5780638da5cb5b146102fa5780638e539e8c1461030257806391ddadf41461031557806395d89b411461032b5780639ab24eb014610333578063a9059cbb14610346578063c3cda52014610359578063d505accf1461036c578063dd62ed3e1461037f578063f1127ed814610392578063f2fde38b146103d1575b5f80fd5b6101696103e4565b6040516101769190611a40565b60405180910390f35b61019261018d366004611a6d565b610474565b6040519015158152602001610176565b6002545b604051908152602001610176565b6101926101c2366004611a95565b61048d565b60405160128152602001610176565b6101a66104b0565b6101a66101ec366004611a6d565b6104be565b6102046101ff366004611a6d565b61052f565b005b610204610214366004611ace565b610545565b60408051808201909152600e81526d06d6f64653d74696d657374616d760941b6020820152610169565b610256610251366004611ae5565b610552565b6040516101769190611afe565b610204610271366004611ae5565b61056f565b610289610284366004611ae5565b61057a565b60405163ffffffff9091168152602001610176565b6101a66102ac366004611ae5565b610584565b61020461059e565b6102046102c7366004611a6d565b6105b1565b6101a66102da366004611ae5565b6105c6565b6102e76105d0565b6040516101769796959493929190611b12565b610256610612565b6101a6610310366004611ace565b610621565b60405165ffffffffffff42168152602001610176565b610169610673565b6101a6610341366004611ae5565b610682565b610192610354366004611a6d565b6106b1565b610204610367366004611bb9565b6106be565b61020461037a366004611c0d565b61077a565b6101a661038d366004611c72565b610893565b6103a56103a0366004611ca3565b6108bd565b60408051825165ffffffffffff1681526020928301516001600160d01b03169281019290925201610176565b6102046103df366004611ae5565b6108d6565b6060600380546103f390611ce0565b80601f016020809104026020016040519081016040528092919081815260200182805461041f90611ce0565b801561046a5780601f106104415761010080835404028352916020019161046a565b820191905f5260205f20905b81548152906001019060200180831161044d57829003601f168201915b5050505050905090565b5f33610481818585610910565b60019150505b92915050565b5f3361049a858285610922565b6104a5858585610972565b506001949350505050565b5f6104b96109cf565b905090565b5f4265ffffffffffff811683106104f5578281604051637669fc0f60e11b81526004016104ec929190611d18565b60405180910390fd5b61051e61050184610af8565b6001600160a01b0386165f908152600a6020526040902090610b29565b6001600160d01b0316949350505050565b610537610bd9565b6105418282610c0b565b5050565b61054f3382610c3f565b50565b6001600160a01b039081165f908152600960205260409020541690565b336105418183610c73565b5f61048782610cec565b6001600160a01b03165f9081526020819052604090205490565b6105a6610bd9565b6105af5f610d0d565b565b6105bc823383610922565b6105418282610c3f565b5f61048782610d5e565b5f6060805f805f60606105e1610d7b565b6105e9610da8565b604080515f80825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6005546001600160a01b031690565b5f4265ffffffffffff8116831061064f578281604051637669fc0f60e11b81526004016104ec929190611d18565b61066361065b84610af8565b600b90610b29565b6001600160d01b03169392505050565b6060600480546103f390611ce0565b6001600160a01b0381165f908152600a602052604081206106a290610dd5565b6001600160d01b031692915050565b5f33610481818585610972565b834211156106e257604051632341d78760e11b8152600481018590526024016104ec565b604080517fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf60208201526001600160a01b0388169181019190915260608101869052608081018590525f9061075b906107539060a00160405160208183030381529060405280519060200120610e0c565b858585610e38565b90506107678187610e64565b6107718188610c73565b50505050505050565b8342111561079e5760405163313c898160e11b8152600481018590526024016104ec565b5f7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886107cc8c610ea2565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090505f61082682610e0c565b90505f61083582878787610e38565b9050896001600160a01b0316816001600160a01b03161461087c576040516325c0072360e11b81526001600160a01b0380831660048301528b1660248201526044016104ec565b6108878a8a8a610910565b50505050505050505050565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b6108c56119fc565b6108cf8383610ec4565b9392505050565b6108de610bd9565b6001600160a01b038116610907575f604051631e4fbdf760e01b81526004016104ec9190611afe565b61054f81610d0d565b61091d8383836001610eed565b505050565b5f61092d8484610893565b90505f19811461096c578181101561095e57828183604051637dc7a0d960e11b81526004016104ec93929190611d2e565b61096c84848484035f610eed565b50505050565b6001600160a01b03831661099b575f604051634b637e8f60e11b81526004016104ec9190611afe565b6001600160a01b0382166109c4575f60405163ec442f0560e01b81526004016104ec9190611afe565b61091d838383610fbf565b5f306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015610a2757507f000000000000000000000000000000000000000000000000000000000000000046145b15610a5157507f000000000000000000000000000000000000000000000000000000000000000090565b6104b9604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b5f65ffffffffffff821115610b25576030826040516306dfcc6560e41b81526004016104ec929190611d4f565b5090565b81545f9081816005811115610b85575f610b4284610fca565b610b4c9085611d76565b5f8881526020902090915081015465ffffffffffff9081169087161015610b7557809150610b83565b610b80816001611d89565b92505b505b5f610b92878785856110ae565b90508015610bcc57610bb687610ba9600184611d76565b5f91825260209091200190565b54600160301b90046001600160d01b0316610bce565b5f5b979650505050505050565b33610be2610612565b6001600160a01b0316146105af573360405163118cdaa760e01b81526004016104ec9190611afe565b6001600160a01b038216610c34575f60405163ec442f0560e01b81526004016104ec9190611afe565b6105415f8383610fbf565b6001600160a01b038216610c68575f604051634b637e8f60e11b81526004016104ec9190611afe565b610541825f83610fbf565b5f610c7d83610552565b6001600160a01b038481165f8181526009602052604080822080546001600160a01b031916888616908117909155905194955093928516927f3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f9190a461091d8183610ce78661110d565b611117565b6001600160a01b0381165f908152600a60205260408120546104879061125a565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b0381165f90815260086020526040812054610487565b60606104b97f00000000000000000000000000000000000000000000000000000000000000006006611285565b60606104b97f00000000000000000000000000000000000000000000000000000000000000006007611285565b80545f908015610e0457610dee83610ba9600184611d76565b54600160301b90046001600160d01b03166108cf565b5f9392505050565b5f610487610e186109cf565b8360405161190160f01b8152600281019290925260228201526042902090565b5f805f80610e488888888861132e565b925092509250610e5882826113ec565b50909695505050505050565b5f610e6e83610ea2565b905080821461091d576040516301d4b62360e61b81526001600160a01b0384166004820152602481018290526044016104ec565b6001600160a01b03165f90815260086020526040902080546001810190915590565b610ecc6119fc565b6001600160a01b0383165f908152600a602052604090206108cf90836114a4565b6001600160a01b038416610f16575f60405163e602df0560e01b81526004016104ec9190611afe565b6001600160a01b038316610f3f575f604051634a1406b160e11b81526004016104ec9190611afe565b6001600160a01b038085165f908152600160209081526040808320938716835292905220829055801561096c57826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610fb191815260200190565b60405180910390a350505050565b61091d838383611506565b5f815f03610fd957505f919050565b5f6001610fe58461156c565b901c6001901b90506001818481610ffe57610ffe611d9c565b048201901c9050600181848161101657611016611d9c565b048201901c9050600181848161102e5761102e611d9c565b048201901c9050600181848161104657611046611d9c565b048201901c9050600181848161105e5761105e611d9c565b048201901c9050600181848161107657611076611d9c565b048201901c9050600181848161108e5761108e611d9c565b048201901c90506108cf818285816110a8576110a8611d9c565b046115ff565b5f5b81831015611105575f6110c38484611614565b5f8781526020902090915065ffffffffffff86169082015465ffffffffffff1611156110f1578092506110ff565b6110fc816001611d89565b93505b506110b0565b509392505050565b5f61048782610584565b816001600160a01b0316836001600160a01b03161415801561113857505f81115b1561091d576001600160a01b038316156111cc576001600160a01b0383165f908152600a60205260408120819061117a9061162e61117586611639565b611667565b6001600160d01b031691506001600160d01b03169150846001600160a01b03165f80516020611e3f83398151915283836040516111c1929190918252602082015260400190565b60405180910390a250505b6001600160a01b0382161561091d576001600160a01b0382165f908152600a6020526040812081906112049061169861117586611639565b6001600160d01b031691506001600160d01b03169150836001600160a01b03165f80516020611e3f833981519152838360405161124b929190918252602082015260400190565b60405180910390a25050505050565b5f63ffffffff821115610b25576020826040516306dfcc6560e41b81526004016104ec929190611d4f565b606060ff831461129f57611298836116a3565b9050610487565b8180546112ab90611ce0565b80601f01602080910402602001604051908101604052809291908181526020018280546112d790611ce0565b80156113225780601f106112f957610100808354040283529160200191611322565b820191905f5260205f20905b81548152906001019060200180831161130557829003601f168201915b50505050509050610487565b5f80806fa2a8918ca85bafe22016d0b997e4df60600160ff1b0384111561135d57505f915060039050826113e2565b604080515f808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa1580156113ae573d5f803e3d5ffd5b5050604051601f1901519150506001600160a01b0381166113d957505f9250600191508290506113e2565b92505f91508190505b9450945094915050565b5f8260038111156113ff576113ff611db0565b03611408575050565b600182600381111561141c5761141c611db0565b0361143a5760405163f645eedf60e01b815260040160405180910390fd5b600282600381111561144e5761144e611db0565b0361146f5760405163fce698f760e01b8152600481018290526024016104ec565b600382600381111561148357611483611db0565b03610541576040516335e2f38360e21b8152600481018290526024016104ec565b6114ac6119fc565b825f018263ffffffff16815481106114c6576114c6611dc4565b5f9182526020918290206040805180820190915291015465ffffffffffff81168252600160301b90046001600160d01b0316918101919091529392505050565b6115118383836116e0565b6001600160a01b038316611561575f61152960025490565b90506001600160d01b038082111561155e57604051630e58ae9360e11b815260048101839052602481018290526044016104ec565b50505b61091d8383836117f3565b5f80608083901c1561158057608092831c92015b604083901c1561159257604092831c92015b602083901c156115a457602092831c92015b601083901c156115b657601092831c92015b600883901c156115c857600892831c92015b600483901c156115da57600492831c92015b600283901c156115ec57600292831c92015b600183901c156104875760010192915050565b5f81831061160d57816108cf565b5090919050565b5f6116226002848418611dd8565b6108cf90848416611d89565b5f6108cf8284611df7565b5f6001600160d01b03821115610b255760d0826040516306dfcc6560e41b81526004016104ec929190611d4f565b5f8061168b4261168361167988610dd5565b868863ffffffff16565b879190611852565b915091505b935093915050565b5f6108cf8284611e1e565b60605f6116af8361185f565b6040805160208082528183019092529192505f91906020820181803683375050509182525060208101929092525090565b6001600160a01b03831661170a578060025f8282546116ff9190611d89565b909155506117679050565b6001600160a01b0383165f90815260208190526040902054818110156117495783818360405163391434e360e21b81526004016104ec93929190611d2e565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b038216611783576002805482900390556117a1565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516117e691815260200190565b60405180910390a3505050565b6001600160a01b03831661181557611812600b61169861117584611639565b50505b6001600160a01b03821661183757611834600b61162e61117584611639565b50505b61091d61184384610552565b61184c84610552565b83611117565b5f8061168b858585611886565b5f60ff8216601f81111561048757604051632cd44ac360e21b815260040160405180910390fd5b82545f90819080156119a2575f6118a287610ba9600185611d76565b60408051808201909152905465ffffffffffff808216808452600160301b9092046001600160d01b0316602084015291925090871610156118f657604051632520601d60e01b815260040160405180910390fd5b805165ffffffffffff808816911603611942578461191988610ba9600186611d76565b80546001600160d01b0392909216600160301b0265ffffffffffff909216919091179055611992565b6040805180820190915265ffffffffffff80881682526001600160d01b0380881660208085019182528b54600181018d555f8d81529190912094519151909216600160301b029216919091179101555b6020015192508391506116909050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a555f8a815291822095519251909316600160301b029190931617920191909155905081611690565b604080518082019091525f808252602082015290565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f6108cf6020830184611a12565b80356001600160a01b0381168114611a68575f80fd5b919050565b5f8060408385031215611a7e575f80fd5b611a8783611a52565b946020939093013593505050565b5f805f60608486031215611aa7575f80fd5b611ab084611a52565b9250611abe60208501611a52565b9150604084013590509250925092565b5f60208284031215611ade575f80fd5b5035919050565b5f60208284031215611af5575f80fd5b6108cf82611a52565b6001600160a01b0391909116815260200190565b60ff60f81b881681525f602060e06020840152611b3260e084018a611a12565b8381036040850152611b44818a611a12565b606085018990526001600160a01b038816608086015260a0850187905284810360c0860152855180825260208088019350909101905f5b81811015611b9757835183529284019291840191600101611b7b565b50909c9b505050505050505050505050565b803560ff81168114611a68575f80fd5b5f805f805f8060c08789031215611bce575f80fd5b611bd787611a52565b95506020870135945060408701359350611bf360608801611ba9565b92506080870135915060a087013590509295509295509295565b5f805f805f805f60e0888a031215611c23575f80fd5b611c2c88611a52565b9650611c3a60208901611a52565b95506040880135945060608801359350611c5660808901611ba9565b925060a0880135915060c0880135905092959891949750929550565b5f8060408385031215611c83575f80fd5b611c8c83611a52565b9150611c9a60208401611a52565b90509250929050565b5f8060408385031215611cb4575f80fd5b611cbd83611a52565b9150602083013563ffffffff81168114611cd5575f80fd5b809150509250929050565b600181811c90821680611cf457607f821691505b602082108103611d1257634e487b7160e01b5f52602260045260245ffd5b50919050565b91825265ffffffffffff16602082015260400190565b6001600160a01b039390931683526020830191909152604082015260600190565b60ff929092168252602082015260400190565b634e487b7160e01b5f52601160045260245ffd5b8181038181111561048757610487611d62565b8082018082111561048757610487611d62565b634e487b7160e01b5f52601260045260245ffd5b634e487b7160e01b5f52602160045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b5f82611df257634e487b7160e01b5f52601260045260245ffd5b500490565b6001600160d01b03828116828216039080821115611e1757611e17611d62565b5092915050565b6001600160d01b03818116838216019080821115611e1757611e17611d6256fedec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724a264697066735822122010b6b082f49e92f5310b2d44761fa7119e3069b5583d966176133e6487c30d9e64736f6c63430008190033";
const GiverABI = [
	{
		"inputs": [
			{
				"internalType": "contract IVotes",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "CheckpointUnorderedInsertion",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "FailedInnerCall",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "GovernorAlreadyCastVote",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "GovernorAlreadyQueuedProposal",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "GovernorDisabledDeposit",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "proposer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "threshold",
				"type": "uint256"
			}
		],
		"name": "GovernorInsufficientProposerVotes",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "targets",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "calldatas",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "values",
				"type": "uint256"
			}
		],
		"name": "GovernorInvalidProposalLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "quorumNumerator",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quorumDenominator",
				"type": "uint256"
			}
		],
		"name": "GovernorInvalidQuorumFraction",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "GovernorInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "GovernorInvalidVoteType",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "votingPeriod",
				"type": "uint256"
			}
		],
		"name": "GovernorInvalidVotingPeriod",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "GovernorNonexistentProposal",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "GovernorNotQueuedProposal",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "GovernorOnlyExecutor",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "GovernorOnlyProposer",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "GovernorQueueNotImplemented",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "proposer",
				"type": "address"
			}
		],
		"name": "GovernorRestrictedProposer",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "enum IGovernor.ProposalState",
				"name": "current",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "expectedStates",
				"type": "bytes32"
			}
		],
		"name": "GovernorUnexpectedProposalState",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentNonce",
				"type": "uint256"
			}
		],
		"name": "InvalidAccountNonce",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidShortString",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "QueueEmpty",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "QueueFull",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "bits",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "SafeCastOverflowedUintDowncast",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "str",
				"type": "string"
			}
		],
		"name": "StringTooLong",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "EIP712DomainChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "ProposalCanceled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "proposer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "string[]",
				"name": "signatures",
				"type": "string[]"
			},
			{
				"indexed": false,
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voteStart",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voteEnd",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "ProposalExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "etaSeconds",
				"type": "uint256"
			}
		],
		"name": "ProposalQueued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldQuorumNumerator",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newQuorumNumerator",
				"type": "uint256"
			}
		],
		"name": "QuorumNumeratorUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "weight",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "VoteCast",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "weight",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "params",
				"type": "bytes"
			}
		],
		"name": "VoteCastWithParams",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BALLOT_TYPEHASH",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CLOCK_MODE",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "COUNTING_MODE",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "EXTENDED_BALLOT_TYPEHASH",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes32",
				"name": "descriptionHash",
				"type": "bytes32"
			}
		],
		"name": "cancel",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			}
		],
		"name": "castVote",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "castVoteBySig",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "castVoteWithReason",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "params",
				"type": "bytes"
			}
		],
		"name": "castVoteWithReasonAndParams",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "support",
				"type": "uint8"
			},
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "params",
				"type": "bytes"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "castVoteWithReasonAndParamsBySig",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "clock",
		"outputs": [
			{
				"internalType": "uint48",
				"name": "",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eip712Domain",
		"outputs": [
			{
				"internalType": "bytes1",
				"name": "fields",
				"type": "bytes1"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "version",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "verifyingContract",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "salt",
				"type": "bytes32"
			},
			{
				"internalType": "uint256[]",
				"name": "extensions",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes32",
				"name": "descriptionHash",
				"type": "bytes32"
			}
		],
		"name": "execute",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			}
		],
		"name": "getVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "params",
				"type": "bytes"
			}
		],
		"name": "getVotesWithParams",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes32",
				"name": "descriptionHash",
				"type": "bytes32"
			}
		],
		"name": "hashProposal",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "nonces",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC1155BatchReceived",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC1155Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC721Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "proposalDeadline",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "proposalEta",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposalNeedsQueuing",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "proposalProposer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "proposalSnapshot",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "proposalThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "proposalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "againstVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "forVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "abstainVotes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "propose",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "calldatas",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes32",
				"name": "descriptionHash",
				"type": "bytes32"
			}
		],
		"name": "queue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"name": "quorum",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "quorumDenominator",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "timepoint",
				"type": "uint256"
			}
		],
		"name": "quorumNumerator",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "quorumNumerator",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "relay",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "state",
		"outputs": [
			{
				"internalType": "enum IGovernor.ProposalState",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC5805",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newQuorumNumerator",
				"type": "uint256"
			}
		],
		"name": "updateQuorumNumerator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingDelay",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingPeriod",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];
const GiverBytecode = "610180604052348015610010575f80fd5b50604051613f28380380613f2883398101604081905261002f91610546565b6004816040518060400160405280600581526020016423b4bb32b960d91b8152508061005f61013860201b60201c565b610069825f610153565b61012052610078816001610153565b61014052815160208084019190912060e052815190820120610100524660a05261010460e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b60805250503060c05260036101198282610604565b50506001600160a01b03166101605261013181610185565b505061075f565b6040805180820190915260018152603160f81b602082015290565b5f60208351101561016e576101678361021f565b905061017f565b816101798482610604565b5060ff90505b92915050565b6064808211156101b75760405163243e544560e01b815260048101839052602481018290526044015b60405180910390fd5b5f6101c061025c565b90506101df6101cd610275565b6101d6856102ef565b60089190610326565b505060408051828152602081018590527f0553476bf02ef2726e8ce5ced78d63e26e602e4a2257b1f559418e24b4633997910160405180910390a1505050565b5f80829050601f81511115610249578260405163305a27a960e01b81526004016101ae91906106c3565b8051610254826106f8565b179392505050565b5f6102676008610340565b6001600160d01b0316905090565b5f6102806101605190565b6001600160a01b03166391ddadf46040518163ffffffff1660e01b8152600401602060405180830381865afa9250505080156102d9575060408051601f3d908101601f191682019092526102d69181019061071b565b60015b6102ea576102e5610388565b905090565b919050565b5f6001600160d01b03821115610322576040516306dfcc6560e41b815260d06004820152602481018390526044016101ae565b5090565b5f80610333858585610392565b915091505b935093915050565b80545f90801561037f5761036683610359600184610740565b5f91825260209091200190565b54660100000000000090046001600160d01b0316610381565b5f5b9392505050565b5f6102e543610514565b82545f90819080156104b7575f6103ae87610359600185610740565b60408051808201909152905465ffffffffffff80821680845266010000000000009092046001600160d01b03166020840152919250908716101561040557604051632520601d60e01b815260040160405180910390fd5b805165ffffffffffff808816911603610454578461042888610359600186610740565b80546001600160d01b039290921666010000000000000265ffffffffffff9092169190911790556104a7565b6040805180820190915265ffffffffffff80881682526001600160d01b0380881660208085019182528b54600181018d555f8d815291909120945191519092166601000000000000029216919091179101555b6020015192508391506103389050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a555f8a8152918220955192519093166601000000000000029190931617920191909155905081610338565b5f65ffffffffffff821115610322576040516306dfcc6560e41b815260306004820152602481018390526044016101ae565b5f60208284031215610556575f80fd5b81516001600160a01b0381168114610381575f80fd5b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061059457607f821691505b6020821081036105b257634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156105ff57805f5260205f20601f840160051c810160208510156105dd5750805b601f840160051c820191505b818110156105fc575f81556001016105e9565b50505b505050565b81516001600160401b0381111561061d5761061d61056c565b6106318161062b8454610580565b846105b8565b602080601f831160018114610664575f841561064d5750858301515b5f19600386901b1c1916600185901b1785556106bb565b5f85815260208120601f198616915b8281101561069257888601518255948401946001909101908401610673565b50858210156106af57878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b805160208083015191908110156105b2575f1960209190910360031b1b16919050565b5f6020828403121561072b575f80fd5b815165ffffffffffff81168114610381575f80fd5b8181038181111561017f57634e487b7160e01b5f52601160045260245ffd5b60805160a05160c05160e051610100516101205161014051610160516137526107d65f395f81816108a401528181610ce9015281816111d701528181611cb90152611dc601525f611c8601525f611c5a01525f611fe501525f611fbd01525f611f1801525f611f4201525f611f6c01526137525ff3fe608060405260043610610257575f3560e01c80637b3c71d31161013f578063b58131b0116100b3578063dd4e2ba511610078578063dd4e2ba5146107b5578063deaaa7cc146107fa578063eb9019d41461082d578063f23a6e611461084c578063f8ce560a14610877578063fc0c546a14610896575f80fd5b8063b58131b01461040a578063bc197c8114610739578063c01f9e3714610764578063c28bc2fa14610783578063c59057e414610796575f80fd5b806391ddadf41161010457806391ddadf41461067357806397c3d3341461069e5780639a802a6d146106b1578063a7713a70146106d0578063a9a95294146106e4578063ab58fb8e14610703575f80fd5b80637b3c71d3146105bb5780637d5e81e2146105da5780637ecebe00146105f957806384b0196e1461062d5780638ff262e314610654575f80fd5b80633932abb1116101d6578063544ffc9c1161019b578063544ffc9c146104c357806354fd4d5014610516578063567813881461053f5780635b8d0e0d1461055e5780635f398a141461057d57806360c4247f1461059c575f80fd5b80633932abb11461040a5780633e4f49e61461041c5780634385963214610448578063452115d6146104905780634bf5d7e9146104af575f80fd5b8063150b7a021161021c578063150b7a0214610343578063160cbed7146103865780632656227d146103a55780632d63f693146103b85780632fe3e261146103d7575f80fd5b806301ffc9a71461026457806302a251a31461029857806306f3f9e6146102b757806306fdde03146102d6578063143489d0146102f7575f80fd5b3661026057005b005b5f80fd5b34801561026f575f80fd5b5061028361027e36600461287f565b6108c8565b60405190151581526020015b60405180910390f35b3480156102a3575f80fd5b5062093a805b60405190815260200161028f565b3480156102c2575f80fd5b5061025e6102d13660046128a6565b610919565b3480156102e1575f80fd5b506102ea61092d565b60405161028f91906128eb565b348015610302575f80fd5b5061032b6103113660046128a6565b5f908152600460205260409020546001600160a01b031690565b6040516001600160a01b03909116815260200161028f565b34801561034e575f80fd5b5061036d61035d3660046129d6565b630a85bd0160e11b949350505050565b6040516001600160e01b0319909116815260200161028f565b348015610391575f80fd5b506102a96103a0366004612b9f565b6109bd565b6102a96103b3366004612b9f565b6109fb565b3480156103c3575f80fd5b506102a96103d23660046128a6565b610b23565b3480156103e2575f80fd5b506102a97f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a81181565b348015610415575f80fd5b505f6102a9565b348015610427575f80fd5b5061043b6104363660046128a6565b610b43565b60405161028f9190612c5c565b348015610453575f80fd5b50610283610462366004612c6a565b5f8281526007602090815260408083206001600160a01b038516845260030190915290205460ff1692915050565b34801561049b575f80fd5b506102a96104aa366004612b9f565b610c79565b3480156104ba575f80fd5b506102ea610ce5565b3480156104ce575f80fd5b506104fb6104dd3660046128a6565b5f908152600760205260409020805460018201546002909201549092565b6040805193845260208401929092529082015260600161028f565b348015610521575f80fd5b506040805180820190915260018152603160f81b60208201526102ea565b34801561054a575f80fd5b506102a9610559366004612ca4565b610da5565b348015610569575f80fd5b506102a9610578366004612d09565b610dcc565b348015610588575f80fd5b506102a9610597366004612db9565b610f28565b3480156105a7575f80fd5b506102a96105b63660046128a6565b610f7b565b3480156105c6575f80fd5b506102a96105d5366004612e36565b611007565b3480156105e5575f80fd5b506102a96105f4366004612e8b565b61104d565b348015610604575f80fd5b506102a9610613366004612f37565b6001600160a01b03165f9081526002602052604090205490565b348015610638575f80fd5b506106416110c3565b60405161028f9796959493929190612f8a565b34801561065f575f80fd5b506102a961066e366004612ff9565b611105565b34801561067e575f80fd5b506106876111d4565b60405165ffffffffffff909116815260200161028f565b3480156106a9575f80fd5b5060646102a9565b3480156106bc575f80fd5b506102a96106cb366004613044565b611260565b3480156106db575f80fd5b506102a961126c565b3480156106ef575f80fd5b506102836106fe3660046128a6565b505f90565b34801561070e575f80fd5b506102a961071d3660046128a6565b5f9081526004602052604090206001015465ffffffffffff1690565b348015610744575f80fd5b5061036d610753366004613096565b63bc197c8160e01b95945050505050565b34801561076f575f80fd5b506102a961077e3660046128a6565b611285565b61025e61079136600461311e565b6112c7565b3480156107a1575f80fd5b506102a96107b0366004612b9f565b611343565b3480156107c0575f80fd5b506040805180820190915260208082527f737570706f72743d627261766f2671756f72756d3d666f722c6162737461696e908201526102ea565b348015610805575f80fd5b506102a97ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d781565b348015610838575f80fd5b506102a961084736600461315b565b61137c565b348015610857575f80fd5b5061036d610866366004613183565b63f23a6e6160e01b95945050505050565b348015610882575f80fd5b506102a96108913660046128a6565b6113a2565b3480156108a1575f80fd5b507f000000000000000000000000000000000000000000000000000000000000000061032b565b5f6001600160e01b031982166332a2ad4360e11b14806108f857506001600160e01b03198216630271189760e51b145b8061091357506301ffc9a760e01b6001600160e01b03198316145b92915050565b6109216113ac565b61092a816113e3565b50565b60606003805461093c906131e2565b80601f0160208091040260200160405190810160405280929190818152602001828054610968906131e2565b80156109b35780601f1061098a576101008083540402835291602001916109b3565b820191905f5260205f20905b81548152906001019060200180831161099657829003601f168201915b5050505050905090565b5f806109cb86868686611343565b90506109e0816109db6004611478565b61149a565b505f604051634844252360e11b815260040160405180910390fd5b5f80610a0986868686611343565b9050610a2981610a196005611478565b610a236004611478565b1761149a565b505f818152600460205260409020805460ff60f01b1916600160f01b17905530610a503090565b6001600160a01b031614610ad9575f5b8651811015610ad757306001600160a01b0316878281518110610a8557610a8561321a565b60200260200101516001600160a01b031603610acf57610acf858281518110610ab057610ab061321a565b60200260200101518051906020012060056114d790919063ffffffff16565b600101610a60565b505b610ae68187878787611547565b6040518181527f712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f906020015b60405180910390a195945050505050565b5f90815260046020526040902054600160a01b900465ffffffffffff1690565b5f818152600460205260408120805460ff600160f01b8204811691600160f81b9004168115610b7757506007949350505050565b8015610b8857506002949350505050565b5f610b9286610b23565b9050805f03610bbc57604051636ad0607560e01b8152600481018790526024015b60405180910390fd5b5f610bc56111d4565b65ffffffffffff169050808210610be257505f9695505050505050565b5f610bec88611285565b9050818110610c0357506001979650505050505050565b610c0c8861161c565b1580610c2b57505f888152600760205260409020805460019091015411155b15610c3e57506003979650505050505050565b5f8881526004602052604090206001015465ffffffffffff165f03610c6b57506004979650505050505050565b506005979650505050505050565b5f80610c8786868686611343565b9050610c96816109db5f611478565b505f818152600460205260409020546001600160a01b03163314610ccf5760405163233d98e360e01b8152336004820152602401610bb3565b610cdb86868686611652565b9695505050505050565b60607f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316634bf5d7e96040518163ffffffff1660e01b81526004015f60405180830381865afa925050508015610d6457506040513d5f823e601f3d908101601f19168201604052610d61919081019061322e565b60015b610da0575060408051808201909152601d81527f6d6f64653d626c6f636b6e756d6265722666726f6d3d64656661756c74000000602082015290565b919050565b5f80339050610dc484828560405180602001604052805f815250611701565b949350505050565b5f80610ead87610ea77f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a8118c8c8c610e1f8e6001600160a01b03165f90815260026020526040902080546001810190915590565b8d8d604051610e2f9291906132a2565b60405180910390208c80519060200120604051602001610e8c9796959493929190968752602087019590955260ff9390931660408601526001600160a01b03919091166060850152608084015260a083015260c082015260e00190565b6040516020818303038152906040528051906020012061172b565b85611757565b905080610ed8576040516394ab6c0760e01b81526001600160a01b0388166004820152602401610bb3565b610f1b89888a89898080601f0160208091040260200160405190810160405280939291908181526020018383808284375f920191909152508b92506117ac915050565b9998505050505050505050565b5f80339050610f7087828888888080601f0160208091040260200160405190810160405280939291908181526020018383808284375f920191909152508a92506117ac915050565b979650505050505050565b600880545f918290610f8e6001846132c5565b81548110610f9e57610f9e61321a565b5f918252602090912001805490915065ffffffffffff811690600160301b90046001600160d01b0316858211610fe0576001600160d01b031695945050505050565b610ff4610fec87611886565b6008906118bc565b6001600160d01b03169695505050505050565b5f80339050610cdb86828787878080601f0160208091040260200160405190810160405280939291908181526020018383808284375f9201919091525061170192505050565b5f33611059818461196b565b6110815760405163d9b3955760e01b81526001600160a01b0382166004820152602401610bb3565b5f6110a78260016110906111d4565b61109a91906132d8565b65ffffffffffff1661137c565b90505f6110b78888888887611a53565b98975050505050505050565b5f6060805f805f60606110d4611c53565b6110dc611c7f565b604080515f80825260208201909252600f60f81b9b939a50919850469750309650945092509050565b5f8061118f84610ea77ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d78989896111588b6001600160a01b03165f90815260026020526040902080546001810190915590565b60408051602081019690965285019390935260ff90911660608401526001600160a01b0316608083015260a082015260c001610e8c565b9050806111ba576040516394ab6c0760e01b81526001600160a01b0385166004820152602401610bb3565b610cdb86858760405180602001604052805f815250611701565b5f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166391ddadf46040518163ffffffff1660e01b8152600401602060405180830381865afa92505050801561124f575060408051601f3d908101601f1916820190925261124c918101906132fe565b60015b610da05761125b611cac565b905090565b5f610dc4848484611cb6565b5f6112776008611d49565b6001600160d01b0316905090565b5f818152600460205260408120546112b990600160d01b810463ffffffff1690600160a01b900465ffffffffffff16613323565b65ffffffffffff1692915050565b6112cf6113ac565b5f80856001600160a01b03168585856040516112ec9291906132a2565b5f6040518083038185875af1925050503d805f8114611326576040519150601f19603f3d011682016040523d82523d5f602084013e61132b565b606091505b509150915061133a8282611d80565b50505050505050565b5f8484848460405160200161135b94939291906133d2565b60408051601f19818403018152919052805160209091012095945050505050565b5f61139b838361139660408051602081019091525f815290565b611cb6565b9392505050565b5f61091382611d9c565b3033146113ce576040516347096e4760e01b8152336004820152602401610bb3565b565b806113db6005611e43565b036113d05750565b6064808211156114105760405163243e544560e01b81526004810183905260248101829052604401610bb3565b5f61141961126c565b90506114386114266111d4565b61142f85611ebf565b60089190611ef2565b505060408051828152602081018590527f0553476bf02ef2726e8ce5ced78d63e26e602e4a2257b1f559418e24b4633997910160405180910390a1505050565b5f81600781111561148b5761148b612c28565b600160ff919091161b92915050565b5f806114a584610b43565b90505f836114b283611478565b160361139b578381846040516331b75e4d60e01b8152600401610bb39392919061341c565b81546001600160801b03600160801b82048116918116600183019091160361151257604051638acb5f2760e01b815260040160405180910390fd5b6001600160801b038082165f90815260018086016020526040909120939093558354919092018216600160801b029116179055565b5f5b8451811015611614575f808683815181106115665761156661321a565b60200260200101516001600160a01b03168684815181106115895761158961321a565b60200260200101518685815181106115a3576115a361321a565b60200260200101516040516115b8919061343e565b5f6040518083038185875af1925050503d805f81146115f2576040519150601f19603f3d011682016040523d82523d5f602084013e6115f7565b606091505b50915091506116068282611d80565b505050806001019050611549565b505050505050565b5f8181526007602052604081206002810154600182015461163d9190613454565b61164961089185610b23565b11159392505050565b5f8061166086868686611343565b90506116ae816116706007611478565b61167a6006611478565b6116846002611478565b6001611691600782613467565b61169c906002613560565b6116a691906132c5565b18181861149a565b505f818152600460205260409081902080546001600160f81b0316600160f81b179055517f789cf55be980739dad1d0699b93b58e806b51c9d96619bfa8fe0a28abaa7b30c90610b129083815260200190565b5f6117228585858561171d60408051602081019091525f815290565b6117ac565b95945050505050565b5f610913611737611f0c565b8360405161190160f01b8152600281019290925260228201526042902090565b5f805f6117648585612035565b5090925090505f81600381111561177d5761177d612c28565b14801561179b5750856001600160a01b0316826001600160a01b0316145b80610cdb5750610cdb86868661207e565b5f6117bb866109db6001611478565b505f6117d0866117ca89610b23565b85611cb6565b90506117df8787878487612154565b82515f0361183357856001600160a01b03167fb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda488878488604051611826949392919061356e565b60405180910390a2610cdb565b856001600160a01b03167fe2babfbac5889a709b63bb7f598b324e08bc5a4fb9ec647fb3cbc9ec07eb87128887848888604051611874959493929190613595565b60405180910390a29695505050505050565b5f65ffffffffffff8211156118b8576040516306dfcc6560e41b81526030600482015260248101839052604401610bb3565b5090565b81545f9081816005811115611918575f6118d584612246565b6118df90856132c5565b5f8881526020902090915081015465ffffffffffff908116908716101561190857809150611916565b611913816001613454565b92505b505b5f6119258787858561232a565b9050801561195f576119498761193c6001846132c5565b5f91825260209091200190565b54600160301b90046001600160d01b0316610f70565b5f979650505050505050565b80515f906034811015611982576001915050610913565b82810160131901516001600160a01b031981166b046e0e4dee0dee6cae47a60f60a31b146119b557600192505050610913565b5f806119c26028856132c5565b90505b83811015611a32575f806119f88884815181106119e4576119e461321a565b01602001516001600160f81b031916612389565b9150915081611a105760019650505050505050610913565b8060ff166004856001600160a01b0316901b17935050508060010190506119c5565b50856001600160a01b0316816001600160a01b031614935050505092915050565b5f611a678686868680519060200120611343565b905084518651141580611a7c57508351865114155b80611a8657508551155b15611abb57855184518651604051630447b05d60e41b8152600481019390935260248301919091526044820152606401610bb3565b5f81815260046020526040902054600160a01b900465ffffffffffff1615611b045780611ae782610b43565b6040516331b75e4d60e01b8152610bb39291905f9060040161341c565b5f80611b0e6111d4565b65ffffffffffff16611b209190613454565b90505f62093a805f84815260046020526040902080546001600160a01b0319166001600160a01b038716178155909150611b5983611886565b815465ffffffffffff91909116600160a01b0265ffffffffffff60a01b19909116178155611b8682612419565b815463ffffffff91909116600160d01b0263ffffffff60d01b1990911617815588517f7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e090859087908c908c906001600160401b03811115611be957611be9612913565b604051908082528060200260200182016040528015611c1c57816020015b6060815260200190600190039081611c075790505b508c89611c298a82613454565b8e604051611c3f999897969594939291906135ce565b60405180910390a150505095945050505050565b606061125b7f00000000000000000000000000000000000000000000000000000000000000005f612449565b606061125b7f00000000000000000000000000000000000000000000000000000000000000006001612449565b5f61125b43611886565b5f7f0000000000000000000000000000000000000000000000000000000000000000604051630748d63560e31b81526001600160a01b038681166004830152602482018690529190911690633a46b1a890604401602060405180830381865afa158015611d25573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610dc491906136a3565b80545f908015611d7857611d628361193c6001846132c5565b54600160301b90046001600160d01b031661139b565b5f9392505050565b606082611d9557611d90826124f2565b610913565b5080610913565b5f6064611da883610f7b565b604051632394e7a360e21b8152600481018590526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638e539e8c90602401602060405180830381865afa158015611e0b573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611e2f91906136a3565b611e3991906136ba565b61091391906136e5565b80545f906001600160801b0380821691600160801b9004168103611e7a576040516375e52f4f60e01b815260040160405180910390fd5b6001600160801b038181165f908152600185810160205260408220805492905585546fffffffffffffffffffffffffffffffff19169301909116919091179092555090565b5f6001600160d01b038211156118b8576040516306dfcc6560e41b815260d0600482015260248101839052604401610bb3565b5f80611eff85858561251b565b915091505b935093915050565b5f306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015611f6457507f000000000000000000000000000000000000000000000000000000000000000046145b15611f8e57507f000000000000000000000000000000000000000000000000000000000000000090565b61125b604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b5f805f835160410361206c576020840151604085015160608601515f1a61205e88828585612691565b955095509550505050612077565b505081515f91506002905b9250925092565b5f805f856001600160a01b0316858560405160240161209e929190613704565b60408051601f198184030181529181526020820180516001600160e01b0316630b135d3f60e11b179052516120d3919061343e565b5f60405180830381855afa9150503d805f811461210b576040519150601f19603f3d011682016040523d82523d5f602084013e612110565b606091505b509150915081801561212457506020815110155b8015610cdb57508051630b135d3f60e11b9061214990830160209081019084016136a3565b149695505050505050565b5f8581526007602090815260408083206001600160a01b0388168452600381019092529091205460ff16156121a7576040516371c6af4960e01b81526001600160a01b0386166004820152602401610bb3565b6001600160a01b0385165f9081526003820160205260409020805460ff1916600117905560ff84166121f05782815f015f8282546121e59190613454565b909155506116149050565b5f1960ff85160161220e5782816001015f8282546121e59190613454565b60011960ff85160161222d5782816002015f8282546121e59190613454565b6040516303599be160e11b815260040160405180910390fd5b5f815f0361225557505f919050565b5f600161226184612759565b901c6001901b9050600181848161227a5761227a6136d1565b048201901c90506001818481612292576122926136d1565b048201901c905060018184816122aa576122aa6136d1565b048201901c905060018184816122c2576122c26136d1565b048201901c905060018184816122da576122da6136d1565b048201901c905060018184816122f2576122f26136d1565b048201901c9050600181848161230a5761230a6136d1565b048201901c905061139b81828581612324576123246136d1565b046127ec565b5f5b81831015612381575f61233f8484612801565b5f8781526020902090915065ffffffffffff86169082015465ffffffffffff16111561236d5780925061237b565b612378816001613454565b93505b5061232c565b509392505050565b5f8060f883901c602f811180156123a35750603a8160ff16105b156123b857600194602f199091019350915050565b8060ff1660401080156123ce575060478160ff16105b156123e3576001946036199091019350915050565b8060ff1660601080156123f9575060678160ff16105b1561240e576001946056199091019350915050565b505f93849350915050565b5f63ffffffff8211156118b8576040516306dfcc6560e41b81526020600482015260248101839052604401610bb3565b606060ff83146124635761245c8361281b565b9050610913565b81805461246f906131e2565b80601f016020809104026020016040519081016040528092919081815260200182805461249b906131e2565b80156124e65780601f106124bd576101008083540402835291602001916124e6565b820191905f5260205f20905b8154815290600101906020018083116124c957829003601f168201915b50505050509050610913565b8051156125025780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b82545f9081908015612637575f6125378761193c6001856132c5565b60408051808201909152905465ffffffffffff808216808452600160301b9092046001600160d01b03166020840152919250908716101561258b57604051632520601d60e01b815260040160405180910390fd5b805165ffffffffffff8088169116036125d757846125ae8861193c6001866132c5565b80546001600160d01b0392909216600160301b0265ffffffffffff909216919091179055612627565b6040805180820190915265ffffffffffff80881682526001600160d01b0380881660208085019182528b54600181018d555f8d81529190912094519151909216600160301b029216919091179101555b602001519250839150611f049050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a555f8a815291822095519251909316600160301b029190931617920191909155905081611f04565b5f80807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411156126ca57505f9150600390508261274f565b604080515f808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa15801561271b573d5f803e3d5ffd5b5050604051601f1901519150506001600160a01b03811661274657505f92506001915082905061274f565b92505f91508190505b9450945094915050565b5f80608083901c1561276d57608092831c92015b604083901c1561277f57604092831c92015b602083901c1561279157602092831c92015b601083901c156127a357601092831c92015b600883901c156127b557600892831c92015b600483901c156127c757600492831c92015b600283901c156127d957600292831c92015b600183901c156109135760010192915050565b5f8183106127fa578161139b565b5090919050565b5f61280f60028484186136e5565b61139b90848416613454565b60605f61282783612858565b6040805160208082528183019092529192505f91906020820181803683375050509182525060208101929092525090565b5f60ff8216601f81111561091357604051632cd44ac360e21b815260040160405180910390fd5b5f6020828403121561288f575f80fd5b81356001600160e01b03198116811461139b575f80fd5b5f602082840312156128b6575f80fd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f61139b60208301846128bd565b80356001600160a01b0381168114610da0575f80fd5b634e487b7160e01b5f52604160045260245ffd5b604051601f8201601f191681016001600160401b038111828210171561294f5761294f612913565b604052919050565b5f6001600160401b0382111561296f5761296f612913565b50601f01601f191660200190565b5f61298f61298a84612957565b612927565b90508281528383830111156129a2575f80fd5b828260208301375f602084830101529392505050565b5f82601f8301126129c7575f80fd5b61139b8383356020850161297d565b5f805f80608085870312156129e9575f80fd5b6129f2856128fd565b9350612a00602086016128fd565b92506040850135915060608501356001600160401b03811115612a21575f80fd5b612a2d878288016129b8565b91505092959194509250565b5f6001600160401b03821115612a5157612a51612913565b5060051b60200190565b5f82601f830112612a6a575f80fd5b81356020612a7a61298a83612a39565b8083825260208201915060208460051b870101935086841115612a9b575f80fd5b602086015b84811015612abe57612ab1816128fd565b8352918301918301612aa0565b509695505050505050565b5f82601f830112612ad8575f80fd5b81356020612ae861298a83612a39565b8083825260208201915060208460051b870101935086841115612b09575f80fd5b602086015b84811015612abe5780358352918301918301612b0e565b5f82601f830112612b34575f80fd5b81356020612b4461298a83612a39565b82815260059290921b84018101918181019086841115612b62575f80fd5b8286015b84811015612abe5780356001600160401b03811115612b83575f80fd5b612b918986838b01016129b8565b845250918301918301612b66565b5f805f8060808587031215612bb2575f80fd5b84356001600160401b0380821115612bc8575f80fd5b612bd488838901612a5b565b95506020870135915080821115612be9575f80fd5b612bf588838901612ac9565b94506040870135915080821115612c0a575f80fd5b50612c1787828801612b25565b949793965093946060013593505050565b634e487b7160e01b5f52602160045260245ffd5b60088110612c5857634e487b7160e01b5f52602160045260245ffd5b9052565b602081016109138284612c3c565b5f8060408385031215612c7b575f80fd5b82359150612c8b602084016128fd565b90509250929050565b803560ff81168114610da0575f80fd5b5f8060408385031215612cb5575f80fd5b82359150612c8b60208401612c94565b5f8083601f840112612cd5575f80fd5b5081356001600160401b03811115612ceb575f80fd5b602083019150836020828501011115612d02575f80fd5b9250929050565b5f805f805f805f60c0888a031215612d1f575f80fd5b87359650612d2f60208901612c94565b9550612d3d604089016128fd565b945060608801356001600160401b0380821115612d58575f80fd5b612d648b838c01612cc5565b909650945060808a0135915080821115612d7c575f80fd5b612d888b838c016129b8565b935060a08a0135915080821115612d9d575f80fd5b50612daa8a828b016129b8565b91505092959891949750929550565b5f805f805f60808688031215612dcd575f80fd5b85359450612ddd60208701612c94565b935060408601356001600160401b0380821115612df8575f80fd5b612e0489838a01612cc5565b90955093506060880135915080821115612e1c575f80fd5b50612e29888289016129b8565b9150509295509295909350565b5f805f8060608587031215612e49575f80fd5b84359350612e5960208601612c94565b925060408501356001600160401b03811115612e73575f80fd5b612e7f87828801612cc5565b95989497509550505050565b5f805f8060808587031215612e9e575f80fd5b84356001600160401b0380821115612eb4575f80fd5b612ec088838901612a5b565b95506020870135915080821115612ed5575f80fd5b612ee188838901612ac9565b94506040870135915080821115612ef6575f80fd5b612f0288838901612b25565b93506060870135915080821115612f17575f80fd5b508501601f81018713612f28575f80fd5b612a2d8782356020840161297d565b5f60208284031215612f47575f80fd5b61139b826128fd565b5f815180845260208085019450602084015f5b83811015612f7f57815187529582019590820190600101612f63565b509495945050505050565b60ff60f81b8816815260e060208201525f612fa860e08301896128bd565b8281036040840152612fba81896128bd565b606084018890526001600160a01b038716608085015260a0840186905283810360c08501529050612feb8185612f50565b9a9950505050505050505050565b5f805f806080858703121561300c575f80fd5b8435935061301c60208601612c94565b925061302a604086016128fd565b915060608501356001600160401b03811115612a21575f80fd5b5f805f60608486031215613056575f80fd5b61305f846128fd565b92506020840135915060408401356001600160401b03811115613080575f80fd5b61308c868287016129b8565b9150509250925092565b5f805f805f60a086880312156130aa575f80fd5b6130b3866128fd565b94506130c1602087016128fd565b935060408601356001600160401b03808211156130dc575f80fd5b6130e889838a01612ac9565b945060608801359150808211156130fd575f80fd5b61310989838a01612ac9565b93506080880135915080821115612e1c575f80fd5b5f805f8060608587031215613131575f80fd5b61313a856128fd565b93506020850135925060408501356001600160401b03811115612e73575f80fd5b5f806040838503121561316c575f80fd5b613175836128fd565b946020939093013593505050565b5f805f805f60a08688031215613197575f80fd5b6131a0866128fd565b94506131ae602087016128fd565b9350604086013592506060860135915060808601356001600160401b038111156131d6575f80fd5b612e29888289016129b8565b600181811c908216806131f657607f821691505b60208210810361321457634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52603260045260245ffd5b5f6020828403121561323e575f80fd5b81516001600160401b03811115613253575f80fd5b8201601f81018413613263575f80fd5b805161327161298a82612957565b818152856020838501011115613285575f80fd5b8160208401602083015e5f91810160200191909152949350505050565b818382375f9101908152919050565b634e487b7160e01b5f52601160045260245ffd5b81810381811115610913576109136132b1565b65ffffffffffff8281168282160390808211156132f7576132f76132b1565b5092915050565b5f6020828403121561330e575f80fd5b815165ffffffffffff8116811461139b575f80fd5b65ffffffffffff8181168382160190808211156132f7576132f76132b1565b5f815180845260208085019450602084015f5b83811015612f7f5781516001600160a01b031687529582019590820190600101613355565b5f8282518085526020808601955060208260051b840101602086015f5b848110156133c557601f198684030189526133b38383516128bd565b98840198925090830190600101613397565b5090979650505050505050565b608081525f6133e46080830187613342565b82810360208401526133f68187612f50565b9050828103604084015261340a818661337a565b91505082606083015295945050505050565b838152606081016134306020830185612c3c565b826040830152949350505050565b5f82518060208501845e5f920191825250919050565b80820180821115610913576109136132b1565b60ff8181168382160190811115610913576109136132b1565b600181815b808511156134ba57815f19048211156134a0576134a06132b1565b808516156134ad57918102915b93841c9390800290613485565b509250929050565b5f826134d057506001610913565b816134dc57505f610913565b81600181146134f257600281146134fc57613518565b6001915050610913565b60ff84111561350d5761350d6132b1565b50506001821b610913565b5060208310610133831016604e8410600b841016171561353b575081810a610913565b6135458383613480565b805f1904821115613558576135586132b1565b029392505050565b5f61139b60ff8416836134c2565b84815260ff84166020820152826040820152608060608201525f610cdb60808301846128bd565b85815260ff8516602082015283604082015260a060608201525f6135bc60a08301856128bd565b82810360808401526110b781856128bd565b5f6101208b8352602060018060a01b038c16818501528160408501526135f68285018c613342565b9150838203606085015261360a828b612f50565b915083820360808501528189518084528284019150828160051b850101838c015f5b8381101561365a57601f198784030185526136488383516128bd565b9486019492509085019060010161362c565b505086810360a088015261366e818c61337a565b9450505050508560c08401528460e084015282810361010084015261369381856128bd565b9c9b505050505050505050505050565b5f602082840312156136b3575f80fd5b5051919050565b8082028115828204841417610913576109136132b1565b634e487b7160e01b5f52601260045260245ffd5b5f826136ff57634e487b7160e01b5f52601260045260245ffd5b500490565b828152604060208201525f610dc460408301846128bd56fea2646970667358221220f6305ebc81569759fccaf7ee60c82b869fdc4e4c34783f62126e409118095e5164736f6c63430008190033";

export { GiversTokenABI, GiversTokenBytecode, GiverABI, GiverBytecode };