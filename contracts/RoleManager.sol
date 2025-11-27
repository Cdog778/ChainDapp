// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleManager
 * @dev Handles role-based access control for the Chain of Custody DApp.
 * Roles: Admin, Investigator, Forensic Technician
 */
contract RoleManager {
    address public admin;

    mapping(address => bool) private investigators;
    mapping(address => bool) private technicians;

    event InvestigatorAdded(address indexed investigator);
    event TechnicianAdded(address indexed technician);
    event RoleRevoked(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ---------------------------
    // ROLE MANAGEMENT
    // ---------------------------

    function addInvestigator(address user) external onlyAdmin {
        investigators[user] = true;
        emit InvestigatorAdded(user);
    }

    function addTechnician(address user) external onlyAdmin {
        technicians[user] = true;
        emit TechnicianAdded(user);
    }

    function revokeRole(address user) external onlyAdmin {
        investigators[user] = false;
        technicians[user] = false;
        emit RoleRevoked(user);
    }

    // ---------------------------
    // ROLE CHECKS
    // ---------------------------

    function isInvestigator(address user) external view returns (bool) {
        return investigators[user];
    }

    function isTechnician(address user) external view returns (bool) {
        return technicians[user];
    }

    function isAdmin(address user) external view returns (bool) {
        return user == admin;
    }
}
