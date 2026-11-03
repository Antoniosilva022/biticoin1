

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BiticoinV2 is ERC20, ERC20Burnable {

    // Supply
    uint256 public constant INITIAL_SUPPLY =
        99_000_000_000 * 10**18;

    uint256 public constant MAX_SUPPLY =
        110_000_000_000 * 10**18;

    // Fundador definido na implantacao
    address public immutable founder;

    // Vesting imutavel
    uint256 public immutable vestingAmount;
    uint256 public immutable vestingReleaseTime;

    bool public vestingReleased;

    event VestingReleased(
        uint256 amount,
        address indexed recipient
    );

    constructor(address founder_)
        ERC20("Biti", "BITI")
    {
        require(
            founder_ != address(0),
            "Endereco do fundador invalido"
        );

        require(
            INITIAL_SUPPLY <= MAX_SUPPLY,
            "Supply inicial excede o limite"
        );

        founder = founder_;

        uint256 immediateSupply =
            (INITIAL_SUPPLY * 80) / 100;

        vestingAmount =
            INITIAL_SUPPLY - immediateSupply;

        vestingReleaseTime =
            block.timestamp + 180 days;

        // 80% para o fundador
        _mint(founder, immediateSupply);

        // 20% bloqueados no contrato
        _mint(address(this), vestingAmount);
    }

    // Liberacao do vesting apos 180 dias
    // Qualquer pessoa pode executar esta funcao.
    // Os tokens sempre vao para o fundador.
    function releaseVesting() external {
        require(
            !vestingReleased,
            "Vesting ja liberado"
        );

        require(
            block.timestamp >= vestingReleaseTime,
            "Vesting ainda bloqueado"
        );

        vestingReleased = true;

        _transfer(
            address(this),
            founder,
            vestingAmount
        );

        emit VestingReleased(
            vestingAmount,
            founder
        );
    }
}
