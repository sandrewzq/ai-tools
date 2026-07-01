import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { verifySignature, parseJwt } from "./logic";

const SAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkRlbW8ifQ.invalid";

export default function Tool() {
  const [token, setToken] = useState(SAMPLE);
  const [secret, setSecret] = useState("");
  const [verify, setVerify] = useState("");
  const parsed = useMemo(() => parseJwt(token), [token]);

  async function runVerify() {
    if ("error" in parsed) return;
    const result = await verifySignature(parsed.headerB64, parsed.payloadB64, parsed.signature, secret, parsed.alg);
    setVerify(result.verified ? "签名有效" : result.reason || "签名无效");
  }

  return (
    <ToolLayout title="JWT 调试" description="解析 JWT Header、Payload 并校验 HS256 签名。">
      <div className="tool-panel tool-stack">
        <textarea value={token} onChange={(event) => setToken(event.target.value)} rows={5} />
        {"error" in parsed ? <p className="tool-status">{parsed.error}</p> : <>
          <div className="two-column"><pre className="tool-output">{parsed.headerRaw}</pre><pre className="tool-output">{parsed.payloadRaw}</pre></div>
          <input value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="HS 密钥" />
          <button type="button" onClick={runVerify}>校验签名</button>
          <p className="tool-status">{verify}</p>
        </>}
      </div>
    </ToolLayout>
  );
}
