
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

  it("deve bloquear 20% no contrato", async function () {
    expect(
      await token.balanceOf(await token.getAddress())
    ).to.equal(ethers.parseEther("19800000000"));
  });

  it("não deve liberar vesting antes de 180 dias", async function () {
    await expect(
      token.releaseVesting()
    ).to.be.revertedWith("Vesting ainda bloqueado");
  });

  it("deve liberar vesting após 180 dias", async function () {
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

  it("não deve possuir funções administrativas de mint ou taxas", async function () {
    expect(token.interface.getFunction("mint")).to.equal(null);
    expect(token.interface.getFunction("pause")).to.equal(null);
    expect(token.interface.getFunction("setTransferFee")).to.equal(null);
    expect(token.interface.getFunction("setFeeRecipient")).to.equal(null);
  });
});
