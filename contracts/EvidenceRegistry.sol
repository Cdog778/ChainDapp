// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RoleManager.sol";

/**
 * @title EvidenceRegistry
 * @dev Core chain-of-custody system for registering evidence,
 * transferring custody, attaching lab reports, and managing cases.
 */
contract EvidenceRegistry {
    RoleManager public roleManager;

    constructor(address _roleManager) {
        roleManager = RoleManager(_roleManager);
    }

    // ------------------------------------------------------------
    // ENUMS & STRUCTS
    // ------------------------------------------------------------

    enum EvidenceType { Physical, Digital, Biological, Video, Other }
    enum CaseStatus { Open, InLab, Closed }

    struct Evidence {
        uint256 id;
        string description;
        EvidenceType evidenceType;
        string ipfsHash;              // Encrypted file hash
        address currentHolder;        // Who has custody
        uint256 timestampCreated;

        string[] labReports;          // IPFS hashes for reports
        CustodyRecord[] custodyHistory;
    }

    struct CustodyRecord {
        address from;
        address to;
        uint256 timestamp;
    }

    struct Case {
        uint256 caseId;
        string title;
        CaseStatus status;
        uint256[] evidenceIds;
        string[] notes;               // Notes or IPFS links
    }

    // ------------------------------------------------------------
    // STORAGE
    // ------------------------------------------------------------

    uint256 public nextEvidenceId;
    uint256 public nextCaseId;

    mapping(uint256 => Evidence) public evidences;
    mapping(uint256 => Case) public cases;

    // ------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------

    event EvidenceRegistered(
        uint256 indexed evidenceId,
        address indexed investigator,
        uint256 timestamp
    );

    event CustodyTransferred(
        uint256 indexed evidenceId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event LabReportAdded(
        uint256 indexed evidenceId,
        string ipfsHash,
        address indexed technician,
        uint256 timestamp
    );

    event CaseCreated(
        uint256 indexed caseId,
        string title,
        uint256 timestamp
    );

    event EvidenceLinkedToCase(
        uint256 indexed caseId,
        uint256 indexed evidenceId
    );

    // ------------------------------------------------------------
    // MODIFIERS
    // ------------------------------------------------------------

    modifier onlyInvestigator() {
        require(
            roleManager.isInvestigator(msg.sender),
            "Not authorized: Investigator only"
        );
        _;
    }

    modifier onlyTechnician() {
        require(
            roleManager.isTechnician(msg.sender),
            "Not authorized: Technician only"
        );
        _;
    }

    modifier onlyCurrentHolder(uint256 evidenceId) {
        require(
            evidences[evidenceId].currentHolder == msg.sender,
            "You do not have custody of this evidence"
        );
        _;
    }

    // ------------------------------------------------------------
    // EVIDENCE MANAGEMENT
    // ------------------------------------------------------------

    function registerEvidence(
        string calldata description,
        EvidenceType evidenceType,
        string calldata ipfsHash
    ) external onlyInvestigator {
        uint256 id = nextEvidenceId++;
        
        Evidence storage e = evidences[id];
        e.id = id;
        e.description = description;
        e.evidenceType = evidenceType;
        e.ipfsHash = ipfsHash;
        e.currentHolder = msg.sender;
        e.timestampCreated = block.timestamp;

        // First custody record
        e.custodyHistory.push(
            CustodyRecord({
                from: address(0),
                to: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit EvidenceRegistered(id, msg.sender, block.timestamp);
    }

    function transferCustody(uint256 evidenceId, address newHolder)
        external
        onlyCurrentHolder(evidenceId)
    {
        address previous = evidences[evidenceId].currentHolder;

        evidences[evidenceId].currentHolder = newHolder;

        evidences[evidenceId].custodyHistory.push(
            CustodyRecord({
                from: previous,
                to: newHolder,
                timestamp: block.timestamp
            })
        );

        emit CustodyTransferred(
            evidenceId,
            previous,
            newHolder,
            block.timestamp
        );
    }

    // ------------------------------------------------------------
    // LAB REPORTS
    // ------------------------------------------------------------

    function addLabReport(uint256 evidenceId, string calldata ipfsHash)
        external
        onlyTechnician
    {
        evidences[evidenceId].labReports.push(ipfsHash);

        emit LabReportAdded(
            evidenceId,
            ipfsHash,
            msg.sender,
            block.timestamp
        );
    }

    // ------------------------------------------------------------
    // CASE MANAGEMENT
    // ------------------------------------------------------------

    function createCase(string calldata title)
        external
        onlyInvestigator
    {
        uint256 caseId = nextCaseId++;

        Case storage c = cases[caseId];
        c.caseId = caseId;
        c.title = title;
        c.status = CaseStatus.Open;

        emit CaseCreated(caseId, title, block.timestamp);
    }

    function linkEvidenceToCase(uint256 caseId, uint256 evidenceId)
        external
        onlyInvestigator
    {
        require(caseId < nextCaseId, "Case does not exist");
        require(evidenceId < nextEvidenceId, "Evidence does not exist");

        cases[caseId].evidenceIds.push(evidenceId);

        emit EvidenceLinkedToCase(caseId, evidenceId);
    }

    function addCaseNote(uint256 caseId, string calldata note)
        external
        onlyInvestigator
    {
        require(caseId < nextCaseId, "Invalid case");

        cases[caseId].notes.push(note);
    }

    function setCaseStatus(uint256 caseId, CaseStatus status)
        external
        onlyInvestigator
    {
        cases[caseId].status = status;
    }

    // ------------------------------------------------------------
    // VERIFICATION
    // ------------------------------------------------------------

    function getEvidenceHash(uint256 evidenceId)
        external
        view
        returns (string memory)
    {
        return evidences[evidenceId].ipfsHash;
    }

    function getCustodyHistory(uint256 evidenceId)
        external
        view
        returns (CustodyRecord[] memory)
    {
        return evidences[evidenceId].custodyHistory;
    }

    function getLabReports(uint256 evidenceId)
        external
        view
        returns (string[] memory)
    {
        return evidences[evidenceId].labReports;
    }
}
