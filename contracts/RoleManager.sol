// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleManager
 * @dev Manages Admin, Investigator, and Technician roles.
 *  - Deployer becomes initial admin (super admin)
 *  - Admins can grant/revoke roles for others
 */
contract RoleManager {
    address public superAdmin;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isInvestigator;
    mapping(address => bool) public isTechnician;

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    event InvestigatorAdded(address indexed account);
    event InvestigatorRemoved(address indexed account);

    event TechnicianAdded(address indexed account);
    event TechnicianRemoved(address indexed account);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
        isAdmin[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    // --------- ADMIN MANAGEMENT ----------

    function addAdmin(address account) external onlyAdmin {
        require(account != address(0), "Invalid address");
        require(!isAdmin[account], "Already admin");
        isAdmin[account] = true;
        emit AdminAdded(account);
    }

    function removeAdmin(address account) external onlyAdmin {
        require(account != superAdmin, "Cannot remove super admin");
        require(isAdmin[account], "Not admin");
        isAdmin[account] = false;
        emit AdminRemoved(account);
    }

    // --------- INVESTIGATOR MANAGEMENT ----------

    function addInvestigator(address account) external onlyAdmin {
        require(account != address(0), "Invalid address");
        require(!isInvestigator[account], "Already investigator");
        isInvestigator[account] = true;
        emit InvestigatorAdded(account);
    }

    function removeInvestigator(address account) external onlyAdmin {
        require(isInvestigator[account], "Not investigator");
        isInvestigator[account] = false;
        emit InvestigatorRemoved(account);
    }

    // --------- TECHNICIAN MANAGEMENT ----------

    function addTechnician(address account) external onlyAdmin {
        require(account != address(0), "Invalid address");
        require(!isTechnician[account], "Already technician");
        isTechnician[account] = true;
        emit TechnicianAdded(account);
    }

    function removeTechnician(address account) external onlyAdmin {
        require(isTechnician[account], "Not technician");
        isTechnician[account] = false;
        emit TechnicianRemoved(account);
    }

    // --------- HELPERS ----------

    function getRoles(address account)
        external
        view
        returns (bool admin, bool investigator, bool technician)
    {
        return (isAdmin[account], isInvestigator[account], isTechnician[account]);
    }
}
