// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OuiDID
 * @notice W3C-inspired Decentralised Identifier for Oui Market students.
 */
contract OuiDID is Ownable, Pausable {
    enum PrivacyLevel { ANONYMOUS, PSEUDONYMOUS, PUBLIC }

    struct DID {
        bytes32 id;
        address wallet;
        string uri;
        PrivacyLevel privacy;
        string ipfsHash;
        bytes32 profileHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    mapping(address => DID) private _dids;
    mapping(bytes32 => address) private _idToWallet;
    uint256 private _nonce;

    event DIDCreated(address indexed wallet, bytes32 indexed didId, string uri);
    event PrivacyUpdated(address indexed wallet, PrivacyLevel privacy);
    event ProfileLinked(address indexed wallet, string ipfsHash, bytes32 profileHash);

    constructor() Ownable(msg.sender) {}

    function createDID(PrivacyLevel privacy) external whenNotPaused {
        require(!_dids[msg.sender].exists, "DID exists");
        
        bytes32 id = keccak256(abi.encodePacked(msg.sender, block.timestamp, _nonce++));
        string memory uri = string(abi.encodePacked("did:oui:", Strings.toHexString(uint256(id))));
        
        _dids[msg.sender] = DID({
            id: id,
            wallet: msg.sender,
            uri: uri,
            privacy: privacy,
            ipfsHash: "",
            profileHash: bytes32(0),
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });
        
        _idToWallet[id] = msg.sender;
        emit DIDCreated(msg.sender, id, uri);
    }

    function updatePrivacy(PrivacyLevel privacy) external {
        require(_dids[msg.sender].exists, "No DID");
        _dids[msg.sender].privacy = privacy;
        _dids[msg.sender].updatedAt = block.timestamp;
        emit PrivacyUpdated(msg.sender, privacy);
    }

    function linkProfile(string calldata ipfsHash, bytes32 profileHash) external {
        DID storage did = _dids[msg.sender];
        require(did.exists, "No DID");
        require(did.privacy != PrivacyLevel.ANONYMOUS, "Anonymous cannot link profile");
        
        did.ipfsHash = ipfsHash;
        did.profileHash = profileHash;
        did.updatedAt = block.timestamp;
        
        emit ProfileLinked(msg.sender, ipfsHash, profileHash);
    }

    function canArbitrate(address wallet) external view returns (bool) {
        DID storage did = _dids[wallet];
        return did.exists && did.privacy != PrivacyLevel.ANONYMOUS;
    }

    function getDID(address wallet) external view returns (DID memory) { return _dids[wallet]; }
    function getDIDById(bytes32 id) external view returns (DID memory) { return _dids[_idToWallet[id]]; }
    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
