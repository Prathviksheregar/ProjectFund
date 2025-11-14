"use client"
import { useEffect, useState } from "react"

const MOCK_KEY = "mockSBTData"
const ADMIN_ADDRESSES = [
  "0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31",
  "0x77a9880fc1637d02e988049c3057ddf9fa43119b",
]
const AUTHORITY_ADDRESSES = [
  "0x8ffb13e194414c545870f8bd2feeedd1d47f5fec",
]

export default function DebugMockPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    try {
      const raw = localStorage.getItem(MOCK_KEY)
      setData(raw ? JSON.parse(raw) : null)
    } catch (e) {
      setData({ error: String(e) })
    }
  }

  function clearMock() {
    localStorage.removeItem(MOCK_KEY)
    refresh()
  }

  function seedAdmins() {
    const current = JSON.parse(localStorage.getItem(MOCK_KEY) || "null") || {}
    current.admins = Array.from(new Set([...(current.admins || []), ...ADMIN_ADDRESSES]))
    localStorage.setItem(MOCK_KEY, JSON.stringify(current))
    refresh()
  }

  function seedAuthority() {
    const current = JSON.parse(localStorage.getItem(MOCK_KEY) || "null") || {}
    current.authorities = Array.from(new Set([...(current.authorities || []), ...AUTHORITY_ADDRESSES]))
    localStorage.setItem(MOCK_KEY, JSON.stringify(current))
    refresh()
  }

  function seedFull() {
    const current = JSON.parse(localStorage.getItem(MOCK_KEY) || "null") || {}
    current.admins = Array.from(new Set([...(current.admins || []), ...ADMIN_ADDRESSES]))
    current.authorities = Array.from(new Set([...(current.authorities || []), ...AUTHORITY_ADDRESSES]))
    // pre-provision token 1000 to primary admin
    current.tokens = current.tokens || {}
    current.tokens[ADMIN_ADDRESSES[0].toLowerCase()] = 1000
    // ensure applications array exists
    current.applications = current.applications || []
    localStorage.setItem(MOCK_KEY, JSON.stringify(current))
    refresh()
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h2>Debug: mockSBTData</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={refresh} style={{ marginRight: 8 }}>Refresh</button>
        <button onClick={seedAdmins} style={{ marginRight: 8 }}>Ensure Admins</button>
        <button onClick={seedAuthority} style={{ marginRight: 8 }}>Ensure Authorities</button>
        <button onClick={seedFull} style={{ marginRight: 8 }}>Seed Full (admins+authority+token)</button>
        <button onClick={clearMock} style={{ marginLeft: 16, color: "#900" }}>Clear</button>
      </div>

      <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, maxHeight: 480, overflow: "auto" }}>
        {JSON.stringify(data, null, 2)}
      </pre>

      <div style={{ marginTop: 12 }}>
        <strong>Admin addresses (seed):</strong>
        <ul>
          {ADMIN_ADDRESSES.map(a => <li key={a}>{a}</li>)}
        </ul>
        <strong>Authority addresses (seed):</strong>
        <ul>
          {AUTHORITY_ADDRESSES.map(a => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  )
}
