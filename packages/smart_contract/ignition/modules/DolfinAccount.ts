import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DolfinAccount", (m) => {
  const dolfinAccount = m.contract("DolfinAccount");

  return { dolfinAccount };
});
