import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { parseJwt, verifySignature } from "./logic";

const SAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkRlbW8ifQ.invalid";

type VerifyState = null | {
  verified: boolean;
  reason?: string;
};

export default function Tool() {
  const [token, setToken] = useState(SAMPLE);
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyState>(null);
  const parsed = useMemo(() => parseJwt(token), [token]);

  async function runVerify() {
    if ("error" in parsed) return;
    const result = await verifySignature(parsed.headerB64, parsed.payloadB64, parsed.signature, secret, parsed.alg);
    setVerifyResult(result);
  }

  return (
    <ToolLayout title="JWT 调试器" description="解析 JWT Header、Payload 并校验 HS256 / HS384 / HS512 签名。">
      <section className="panel tool-panel tool-stack">
        <textarea
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setVerifyResult(null);
          }}
          rows={5}
          spellCheck={false}
        />

        {"error" in parsed ? (
          <div className="regex-error">{parsed.error}</div>
        ) : (
          <>
            <div className="two-column">
              <section>
                <h3>Header</h3>
                <pre className="jwt-code-panel">{JSON.stringify(parsed.header, null, 2)}</pre>
              </section>
              <section>
                <h3>Payload</h3>
                <pre className="jwt-code-panel">{JSON.stringify(parsed.payload, null, 2)}</pre>
              </section>
            </div>

            <section>
              <h3>Signature</h3>
              <code className="jwt-sig">{parsed.signature}</code>
            </section>

            <div className="tool-inline-controls">
              <input
                value={secret}
                onChange={(event) => {
                  setSecret(event.target.value);
                  setVerifyResult(null);
                }}
                placeholder="HS 密钥"
              />
              <button type="button" onClick={runVerify}>
                校验签名
              </button>
            </div>

            <div>
              {verifyResult ? (
                verifyResult.verified ? (
                  <span className="jwt-verify-ok">签名验证通过</span>
                ) : (
                  <span className="jwt-verify-fail">{verifyResult.reason || "签名验证失败"}</span>
                )
              ) : (
                <span className="jwt-verify-hint">输入密钥后可验证签名</span>
              )}
            </div>
          </>
        )}
      </section>
    </ToolLayout>
  );
}
