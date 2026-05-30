import { expect } from "chai";
import { network } from "hardhat";

describe("Biticoin", function () {
  let ethers;
  let token, owner, addr1, addr2;

  beforeEach(async function () {
    ({ ethers } = await network.create());
    [owner, addr1, addr2] = await ethers.getSigners();
    const Biticoin = await ethers.getContractFactory("Biticoin");
    token = await Biticoin.deploy();
    await token.waitForDeployment();
  });

  // ── Metadados ───────────────────────────────────────────────────
  it("deve ter nome e símbolo corretos", async function () {
    expect(await token.name()).to.equal("Biti");
    expect(await token.symbol()).to.equal("BITI");
  });

  // ── Supply e vesting ────────────────────────────────────────────
  it("deve mintar 80% do supply para o owner no constructor", async function () {
    const totalSupply  = await token.totalSupply();
    const ownerBalance = await token.balanceOf(owner.address);
    const expected60   = (totalSupply * 80n) / 100n;
    expect(ownerBalance).to.equal(expected60);
  });

  it("deve travar 20% do supply em vesting no contrato", async function () {
    const totalSupply = await token.totalSupply();
    const contractBal = await token.balanceOf(await token.getAddress());
    const expected40  = (totalSupply * 20n) / 100n;
    expect(contractBal).to.equal(expected40);
  });

  it("deve ter supply total de 99 bilhões", async function () {
    const expected = ethers.parseEther("99000000000");
    expect(await token.totalSupply()).to.equal(expected);
  });

  it("não deve liberar vesting antes do prazo", async function () {
    await expect(token.releaseVesting()).to.be.revertedWith(
      "Periodo de vesting ainda em andamento"
    );
  });

  // ── Mint com teto ────────────────────────────────────────────────
  it("deve permitir mint pelo owner respeitando MAX_SUPPLY", async function () {
    await token.mint(addr1.address, ethers.parseEther("1000"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
  });

  it("deve rejeitar mint que ultrapasse MAX_SUPPLY", async function () {
    const maxSupply   = await token.MAX_SUPPLY();
    const totalSupply = await token.totalSupply();
    const excess      = maxSupply - totalSupply + 1n;
    await expect(token.mint(addr1.address, excess)).to.be.revertedWith(
      "Excede o supply maximo de 110 bilhoes"
    );
  });

  // ── Burn ─────────────────────────────────────────────────────────
  it("deve permitir burning de tokens", async function () {
    const before = await token.totalSupply();
    await token.burn(ethers.parseEther("1000"));
    expect(await token.totalSupply()).to.equal(before - ethers.parseEther("1000"));
  });

  // ── Transferência ────────────────────────────────────────────────
  it("deve transferir tokens corretamente", async function () {
    const amount = ethers.parseEther("500");
    await token.transfer(addr1.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("deve emitir evento Transfer", async function () {
    await expect(token.transfer(addr1.address, ethers.parseEther("100")))
      .to.emit(token, "Transfer");
  });

  // ── Pause ────────────────────────────────────────────────────────
  it("deve pausar e bloquear transferências", async function () {
    await token.pause();
    expect(await token.paused()).to.equal(true);
    await expect(
      token.transfer(addr1.address, ethers.parseEther("100"))
    ).to.be.revert(ethers);
  });

  it("deve retomar transferências após unpause", async function () {
    await token.pause();
    await token.unpause();
    expect(await token.paused()).to.equal(false);
    await expect(token.transfer(addr1.address, ethers.parseEther("100")))
      .to.emit(token, "Transfer");
  });

  // ── Taxa de transação ────────────────────────────────────────────
  it("deve aplicar taxa de transação quando configurada", async function () {
    const initial = ethers.parseEther("1000");
    await token.transfer(addr1.address, initial);
    await token.setTransferFee(200); // 2%
    await token.connect(addr1).transfer(addr2.address, initial);
    const fee = (initial * 200n) / 10000n;
    expect(await token.balanceOf(addr2.address)).to.equal(initial - fee);
  });

  it("deve rejeitar taxa acima de 5%", async function () {
    await expect(token.setTransferFee(501)).to.be.revertedWith(
      "Taxa excede o maximo de 5%"
    );
  });

  // ── Controle de acesso ───────────────────────────────────────────
  it("não deve permitir mint por não-owner", async function () {
    await expect(
      token.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
    ).to.be.revert(ethers);
  });

  it("não deve permitir pause por não-owner", async function () {
    await expect(token.connect(addr1).pause()).to.be.revert(ethers);
  });

  it("não deve permitir setTransferFee por não-owner", async function () {
    await expect(token.connect(addr1).setTransferFee(100)).to.be.revert(ethers);
  });

  it("não deve permitir releaseVesting por não-owner", async function () {
    await expect(token.connect(addr1).releaseVesting()).to.be.revert(ethers);
  });

  // ── Vesting após prazo ───────────────────────────────────────────
  it("deve liberar vesting após 180 dias", async function () {
    const vestingAmount = await token.vestingAmount();
    const ownerBefore   = await token.balanceOf(owner.address);

    // Avança 181 dias no tempo da blockchain
    await ethers.provider.send("evm_increaseTime", [181 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await token.releaseVesting();

    expect(await token.vestingReleased()).to.equal(true);
    expect(await token.balanceOf(owner.address)).to.equal(ownerBefore + vestingAmount);
    expect(await token.balanceOf(await token.getAddress())).to.equal(0n);
  });

  it("não deve liberar vesting duas vezes", async function () {
    await ethers.provider.send("evm_increaseTime", [181 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    await token.releaseVesting();
    await expect(token.releaseVesting()).to.be.revertedWith("Vesting ja liberado");
  });

  // ── Taxa — isenções e destinatário ───────────────────────────────
  it("não deve cobrar taxa do owner", async function () {
    await token.setTransferFee(200); // 2%
    const amount = ethers.parseEther("1000");
    await token.transfer(addr1.address, amount);
    // owner transferiu: addr1 deve receber valor cheio
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("deve enviar taxa para o feeRecipient", async function () {
    const amount = ethers.parseEther("1000");
    await token.transfer(addr1.address, amount);
    await token.setTransferFee(200); // 2%
    await token.setFeeRecipient(addr2.address);

    await token.connect(addr1).transfer(owner.address, amount);
    const fee = (amount * 200n) / 10000n;
    expect(await token.balanceOf(addr2.address)).to.equal(fee);
  });

  it("deve rejeitar feeRecipient com endereço zero", async function () {
    await expect(
      token.setFeeRecipient(ethers.ZeroAddress)
    ).to.be.revertedWith("Endereco invalido");
  });

  // ── transferFrom / allowance ─────────────────────────────────────
  it("deve executar transferFrom com allowance correta", async function () {
    const amount = ethers.parseEther("500");
    await token.transfer(addr1.address, amount);
    await token.connect(addr1).approve(addr2.address, amount);
    await token.connect(addr2).transferFrom(addr1.address, owner.address, amount);
    expect(await token.balanceOf(owner.address)).to.be.gt(0n);
  });

  it("deve rejeitar transferFrom sem allowance suficiente", async function () {
    const amount = ethers.parseEther("500");
    await token.transfer(addr1.address, amount);
    await expect(
      token.connect(addr2).transferFrom(addr1.address, owner.address, amount)
    ).to.be.revert(ethers);
  });
});