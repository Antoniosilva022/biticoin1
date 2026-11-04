
import { expect } from "chai";
import { network } from "hardhat";

describe("BiticoinV2 - Testes de segurança", function () {
  let ethers;
  let token;
  let founder;
  let anotherUser;

  beforeEach(async function () {
    ({ ethers } = await network.create());

    [founder, anotherUser] = await ethers.getSigners();

    const BiticoinV2 = await ethers.getContractFactory("BiticoinV2");

    token = await BiticoinV2.deploy(founder.address);
    await token.waitForDeployment();
  });

  it("deve ter nome e símbolo corretos", async function () {
    expect(await token.name()).to.equal("Biti");
    expect(await token.symbol()).to.equal("BITI");
  });

  it("deve criar exatamente 99 bilhões de BITI", async function () {
    expect(await token.totalSupply()).to.equal(
      ethers.parseEther("99000000000")
    );
  });

  it("deve entregar 80% ao fundador", async function () {
    expect(await token.balanceOf(founder.address)).to.equal(
      ethers.parseEther("79200000000")
    );
  });

  it("deve bloquear 20% no contrato durante o vesting", async function () {
    expect(
      await token.balanceOf(await token.getAddress())
    ).to.equal(ethers.parseEther("19800000000"));
  });

  it("deve ter fundador definido permanentemente", async function () {
    expect(await token.founder()).to.equal(founder.address);
  });

  it("não deve liberar vesting antes de 180 dias", async function () {
    await expect(
      token.releaseVesting()
    ).to.be.revertedWith("Vesting ainda bloqueado");
  });

  it("deve permitir liberar vesting após 180 dias", async function () {
    await ethers.provider.send("evm_increaseTime", [181 * 86400]);
    await ethers.provider.send("evm_mine");

    await token.connect(anotherUser).releaseVesting();

    expect(await token.vestingReleased()).to.equal(true);

    expect(await token.balanceOf(founder.address)).to.equal(
      ethers.parseEther("99000000000")
    );

    expect(
      await token.balanceOf(await token.getAddress())
    ).to.equal(0n);
  });

  it("não deve permitir liberar vesting duas vezes", async function () {
    await ethers.provider.send("evm_increaseTime", [181 * 86400]);
    await ethers.provider.send("evm_mine");

    await token.releaseVesting();

    await expect(
      token.releaseVesting()
    ).to.be.revertedWith("Vesting ja liberado");
  });

  it("deve permitir transferências sem cobrança de taxa", async function () {
    const amount = ethers.parseEther("1000");

    await token.transfer(anotherUser.address, amount);

    expect(await token.balanceOf(anotherUser.address)).to.equal(amount);
  });

  it("deve permitir que o titular queime seus próprios tokens", async function () {
    const amount = ethers.parseEther("1000");

    const supplyBefore = await token.totalSupply();

    await token.burn(amount);

    expect(await token.totalSupply()).to.equal(
      supplyBefore - amount
    );
  });

  it("não deve possuir função administrativa de mint", async function () {
    expect(token.interface.getFunction("mint")).to.equal(null);
  });

  it("não deve possuir função administrativa de pause", async function () {
    expect(token.interface.getFunction("pause")).to.equal(null);
    expect(token.interface.getFunction("unpause")).to.equal(null);
  });

  it("não deve possuir funções administrativas de taxas", async function () {
    expect(token.interface.getFunction("setTransferFee")).to.equal(null);
    expect(token.interface.getFunction("setFeeRecipient")).to.equal(null);
  });

  it("não deve possuir função administrativa de owner", async function () {
    expect(token.interface.getFunction("owner")).to.equal(null);
  });
});

