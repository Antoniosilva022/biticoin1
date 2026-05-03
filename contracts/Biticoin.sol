// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Biticoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    // Supply
    uint256 public constant INITIAL_SUPPLY = 99_000_000_000 * 10**18;  // 99 bilhões
    uint256 public constant MAX_SUPPLY     = 110_000_000_000 * 10**18; // teto: 110 bilhões

    // Taxa de transação (basis points: 100 = 1%, máx 5%)
    uint256 public transferFeeBps = 0;
    uint256 public constant MAX_FEE_BPS = 500;
    address public feeRecipient;

    // Vesting: 20% do supply travado por 6 meses para o founder
    uint256 public vestingAmount;
    uint256 public vestingReleaseTime;
    bool    public vestingReleased = false;

    event TransferFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    event VestingReleased(uint256 amount, address to);

    constructor() ERC20("Biti", "BITI") Ownable(msg.sender) {
        feeRecipient = msg.sender;

        // 80% liberado imediatamente para o owner
        uint256 immediateSupply = (INITIAL_SUPPLY * 80) / 100;
        _mint(msg.sender, immediateSupply);

        // 20% em vesting por 6 meses (guardado no próprio contrato)
        vestingAmount      = INITIAL_SUPPLY - immediateSupply;
        vestingReleaseTime = block.timestamp + 180 days;
        _mint(address(this), vestingAmount);
    }

    // Liberar tokens do vesting após 6 meses
    function releaseVesting() external onlyOwner {
        require(!vestingReleased, "Vesting ja liberado");
        require(block.timestamp >= vestingReleaseTime, "Periodo de vesting ainda em andamento");
        vestingReleased = true;
        _transfer(address(this), owner(), vestingAmount);
        emit VestingReleased(vestingAmount, owner());
    }

    // Mintar novos tokens respeitando o teto máximo
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Excede o supply maximo de 110 bilhoes");
        _mint(to, amount);
    }

    // Pausar/despausar transferências em emergência
    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Definir taxa de transação (máx 5%)
    function setTransferFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= MAX_FEE_BPS, "Taxa excede o maximo de 5%");
        transferFeeBps = feeBps;
        emit TransferFeeUpdated(feeBps);
    }

    // Definir destinatário das taxas
    function setFeeRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Endereco invalido");
        feeRecipient = recipient;
        emit FeeRecipientUpdated(recipient);
    }

    // Override _update: aplica taxa e controla pause
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Pausable)
    {
        // Cobrar taxa apenas em transferências normais (não mint/burn/vesting/owner)
        if (
            transferFeeBps > 0 &&
            from != address(0) &&
            to   != address(0) &&
            from != owner()    &&
            from != address(this)
        ) {
            uint256 fee = (value * transferFeeBps) / 10000;
            if (fee > 0) {
                value -= fee;
                super._update(from, feeRecipient, fee); // taxa também passa pelo pause check
            }
        }
        super._update(from, to, value); // passa pelo ERC20Pausable (verifica pause)
    }
}