import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CC3_TESTNET_PROVER = "0x0000000000000000000000000000000000000FD2";
const CC3_TESTNET_DECODER = "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f";

export default buildModule("Vince", (m) => {
  const prover = m.getParameter("prover", CC3_TESTNET_PROVER);
  const decoder = m.getParameter("decoder", CC3_TESTNET_DECODER);

  const registry = m.contract("VinceRegistry");
  const vusd = m.contract("MockVUSD");
  const verifier = m.contract("VinceVerifier", [prover, decoder]);
  const engine = m.contract("VinceEngine", [registry, decoder, verifier]);
  const gate = m.contract("VinceGate", [verifier, engine]);
  m.call(engine, "setGate", [gate]);
  const vault = m.contract("VinceVault", [engine, vusd]);
  m.call(vusd, "mint", [vault, 1_000_000n * 10n ** 18n]);

  return { registry, verifier, engine, gate, vault, vusd };
});
