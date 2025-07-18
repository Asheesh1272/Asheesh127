import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("CoreProtestModule", (m) => {
  const coreProtest = m.contract("CoreProtest");
  return { coreProtest };
});

export default DeployModule;
