"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CSS = `
.lp-brand-panel{flex:1;background:#121417;border-right:1px solid #2E3238;display:flex;flex-direction:column;justify-content:space-between;padding:45px;position:relative;overflow:hidden}
.lp-grid{position:absolute;inset:0;opacity:.5;pointer-events:none;background-image:linear-gradient(#22262B 1px,transparent 1px),linear-gradient(90deg,#22262B 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse at 30% 30%,black 0%,transparent 65%);-webkit-mask-image:radial-gradient(ellipse at 30% 30%,black 0%,transparent 65%)}
.lp-brand-mark{display:flex;align-items:center;gap:11px;z-index:1}
.lp-brand-mark span{font-size:20px;font-weight:600;letter-spacing:.3px;color:#ECEDEE}
.lp-mono{font-family:'IBM Plex Mono',monospace}
.lp-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:15px;color:#82889A;letter-spacing:.8px;text-transform:uppercase;margin-bottom:17px}
.lp-h{font-size:34px;font-weight:600;line-height:1.3;letter-spacing:-.3px;margin-bottom:17px;color:#ECEDEE}
.lp-sub{font-size:18px;color:#A8ADB8;line-height:1.6}
.lp-meter-row{display:flex;align-items:center;gap:11px;margin-bottom:11px}
.lp-meter-label{font-size:15px;color:#82889A;font-family:'IBM Plex Mono',monospace;width:90px;flex-shrink:0}
.lp-meter-track{flex:1;height:4px;background:#22262B;border-radius:3px;overflow:hidden}
.lp-meter-fill{height:100%;background:#6C9BFF;border-radius:3px}
.lp-brand-footer{font-size:15px;color:#82889A;font-family:'IBM Plex Mono',monospace;margin-top:6px}
.lp-form-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:45px;background:#0A0B0D}
.lp-form-box{width:100%;max-width:588px}
.lp-title{font-size:24px;font-weight:600;color:#ECEDEE;margin-bottom:6px}
.lp-form-sub{font-size:18px;color:#B0B5C0;margin-bottom:34px}
.lp-error{display:none;align-items:center;gap:11px;background:rgba(240,85,92,.12);border:1px solid #F0555C;border-radius:10px;padding:11px 14px;font-size:17px;color:#F0555C;margin-bottom:22px}
.lp-error.show{display:flex}
.lp-field{margin-bottom:20px}
.lp-field label{display:block;font-size:15px;color:#9BA0AC;letter-spacing:.4px;margin-bottom:8px}
.lp-iwrap{position:relative}
.lp-iwrap .lp-input-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#9BA0AC;pointer-events:none}
.lp-iwrap input{width:100%;box-sizing:border-box;background:#121417;border:1px solid #2E3238;border-radius:10px;padding:14px 44px 14px 48px;font-size:18px;color:#ECEDEE;outline:none;font-family:inherit;transition:border-color .12s}
.lp-iwrap input.pw-input{padding-right:48px}
.lp-iwrap input::placeholder{color:#82889A}
.lp-iwrap input:focus{border-color:#6C9BFF}
.lp-iwrap input.err{border-color:#F0555C}
.lp-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#9BA0AC;background:none;border:none;cursor:pointer;padding:6px;display:flex;line-height:0}
.lp-toggle:hover{color:#B0B5C0}
.lp-submit{width:100%;padding:14px;border-radius:10px;border:1px solid #6C9BFF;background:#6C9BFF;color:#0A0B0D;font-size:18px;font-weight:500;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:11px;transition:opacity .12s}
.lp-submit:hover{opacity:.9}
.lp-submit:disabled{opacity:.5;cursor:not-allowed}
.lp-spinner{width:18px;height:18px;border:3px solid rgba(10,11,13,.3);border-top-color:#0A0B0D;border-radius:50%;animation:spin .7s linear infinite;display:none}
.lp-submit.loading .lp-spinner{display:block}
.lp-submit.loading .lp-bt{display:none}
@keyframes spin{to{transform:rotate(360deg)}}
.lp-footer{margin-top:34px;padding-top:22px;border-top:1px solid #22262B;font-size:16px;color:#82889A;text-align:center;line-height:1.6}
@media(max-width:1075px){.lp-brand-panel{display:none}.lp-form-panel{padding:34px}.lp-form-box{max-width:100%}}
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error — check connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="lp-brand-panel">
        <div className="lp-grid" />
        <div className="lp-brand-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C9BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>Blob Drive</span>
        </div>
        <div style={{ zIndex: 1, maxWidth: 520 }}>
          <div className="lp-eyebrow">Staff access</div>
          <div className="lp-h">Storage for the Alva&rsquo;s Education Foundation team.</div>
          <div className="lp-sub">Sign in with your staff credentials to browse, upload, and share department files.</div>
        </div>
        <div style={{ zIndex: 1 }}>
          <div className="lp-meter-row"><span className="lp-meter-label">uploads</span><div className="lp-meter-track"><div className="lp-meter-fill" style={{ width: "45.8%" }} /></div></div>
          <div className="lp-meter-row"><span className="lp-meter-label">reports</span><div className="lp-meter-track"><div className="lp-meter-fill" style={{ width: "24.6%" }} /></div></div>
          <div className="lp-meter-row"><span className="lp-meter-label">backups</span><div className="lp-meter-track"><div className="lp-meter-fill" style={{ width: "88.4%" }} /></div></div>
          <div className="lp-brand-footer">aietnew &middot; 3 containers</div>
        </div>
      </div>

      <div className="lp-form-panel">
        <div className="lp-form-box">
          <div className="lp-title">Sign in</div>
          <div className="lp-form-sub">Use the account provided by your admin.</div>

          <div className={`lp-error${error ? " show" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label>Username</label>
              <div className="lp-iwrap">
                <svg className="lp-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className={error ? "err" : ""}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Password</label>
              <div className="lp-iwrap">
                <svg className="lp-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPw ? "text" : "password"}
                  className={`pw-input${error ? " err" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="lp-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.7 18.7 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`lp-submit${loading ? " loading" : ""}`}>
              <span className="lp-spinner" />
              <span className="lp-bt">Sign in</span>
            </button>
          </form>

          <div className="lp-footer">
            Access is provisioned by your Super Admin.<br />
            Contact IT support if you don&rsquo;t have credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
