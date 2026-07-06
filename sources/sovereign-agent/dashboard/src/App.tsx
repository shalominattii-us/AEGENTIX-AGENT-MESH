import { useState, useEffect, useCallback } from 'react'
import type { DashboardEvent, ExoFrame, SafetyCheck } from './types/exo'

const WS_URL = 'ws://localhost:8765'

function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [event, setEvent] = useState<DashboardEvent | null>(null)
  const [history, setHistory] = useState<DashboardEvent[]>([])

  useEffect(() => {
    let ws: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout>

    const connect = () => {
      ws = new WebSocket(WS_URL)
      ws.onopen = () => {
        setConnected(true)
        ws?.send(JSON.stringify({ action: 'ping' }))
      }
      ws.onmessage = (e) => {
        try {
          const data: DashboardEvent = JSON.parse(e.data)
          if (data.type === 'history' && Array.isArray(data.data)) {
            setHistory(data.data as DashboardEvent[])
          } else {
            setEvent(data)
            setHistory((h) => [data, ...h].slice(0, 50))
          }
        } catch {}
      }
      ws.onclose = () => {
        setConnected(false)
        timer = setTimeout(connect, 3000)
      }
      ws.onerror = () => setConnected(false)
    }

    connect()
    return () => {
      clearTimeout(timer)
      ws?.close()
    }
  }, [])

  return { connected, event, history }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>{title}</h2>
      {children}
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={metricStyle}>
      <span style={metricLabelStyle}>{label}</span>
      <span style={{ ...metricValueStyle, color: color || '#00ff88' }}>{value}</span>
    </div>
  )
}

function Bar({ pct, max = 100, thresholds = [30, 15] }: { pct: number; max?: number; thresholds?: number[] }) {
  const width = Math.min((pct / max) * 100, 100)
  const color = width > thresholds[0] ? '#00ff88' : width > thresholds[1] ? '#ffaa00' : '#ff4444'
  return (
    <div style={barContainerStyle}>
      <div style={{ ...barFillStyle, width: `${width}%`, background: color }} />
    </div>
  )
}

export default function App() {
  const { connected, event, history } = useWebSocket()
  const [exo, setExo] = useState<ExoFrame | null>(null)
  const [safety, setSafety] = useState<SafetyCheck | null>(null)

  useEffect(() => {
    if (event?.data && typeof event.data === 'object') {
      const d = event.data as ExoFrame & { safety?: SafetyCheck }
      setExo(d)
      if (d.safety) setSafety(d.safety)
    }
  }, [event])

  const s = exo?.sensors
  const power = exo?.power_cells
  const totalCap = power?.reduce((a, c) => a + (c.capacity_wh || 0), 0) || 0
  const totalRem = power?.reduce((a, c) => a + (c.remaining_wh || 0), 0) || 0
  const battPct = totalCap > 0 ? (totalRem / totalCap) * 100 : 0

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={headerTitleStyle}>Ω SOV GEN X — EXOSKELETON LIVE</h1>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          <span style={{ ...statusDotStyle, background: connected ? '#00ff88' : '#ff4444' }} />
          WebSocket: {connected ? 'connected' : 'disconnected'}
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="Frame Status">
          <Metric label="Frame ID" value={exo?.frame_id || '--'} />
          <Metric label="Model" value={exo?.model || '--'} />
          <Metric label="Status" value={exo?.status || '--'} color={exo?.status === 'emergency' ? '#ff4444' : '#00ff88'} />
          <Metric label="Wearer" value={exo?.wearer_id || '--'} />
          <Metric label="Node" value={exo?.aegentis_node || '--'} />
        </Card>

        <Card title="Power">
          <Metric label="Battery" value={`${battPct.toFixed(1)}%`} />
          <Bar pct={battPct} />
          <Metric label="Remaining" value={`${totalRem.toFixed(1)} / ${totalCap.toFixed(1)} Wh`} />
          <Metric label="Voltage" value={`${(power?.[0]?.voltage_v || 0).toFixed(1)}V`} />
          <Metric label="Current" value={`${(power?.[0]?.current_a || 0).toFixed(1)}A`} />
          <Metric label="Temp" value={`${(power?.[0]?.temperature_c || 0).toFixed(1)}°C`} />
        </Card>

        <Card title="Biomechanics">
          <Metric label="Heart Rate" value={`${s?.heart_rate_bpm || 0} BPM`} />
          <Metric label="Posture" value={`${(s?.posture_score || 0).toFixed(1)}/100`} />
          <Metric label="Gait" value={s?.gait_phase || '--'} />
          <Metric label="Accel" value={`${s?.imu ? Math.sqrt(s.imu.accel_x**2 + s.imu.accel_y**2 + s.imu.accel_z**2).toFixed(2) : '0'} G`} />
        </Card>

        <Card title="Assist Force">
          <Metric label="Lower" value={`${(exo?.total_assist_lower_n || 0).toFixed(1)}N`} />
          <Bar pct={exo?.total_assist_lower_n || 0} max={500} />
          <Metric label="Upper" value={`${(exo?.total_assist_upper_n || 0).toFixed(1)}N`} />
          <Bar pct={exo?.total_assist_upper_n || 0} max={200} />
        </Card>

        <Card title="Safety">
          <Metric label="Severity" value={safety?.severity || 'NORMAL'} color={
            safety?.severity === 'CRITICAL' ? '#ff4444' : safety?.severity === 'HIGH' ? '#ffaa00' : '#00ff88'
          } />
          <Metric label="Flags" value={(safety?.flags || []).join(', ') || 'none'} />
          <Metric label="Emergency" value={safety?.emergency_release ? 'ARMED' : 'SAFE'} color={safety?.emergency_release ? '#ff4444' : '#00ff88'} />
        </Card>

        <Card title="Joints">
          <div style={jointGridStyle}>
            {(exo?.joints || []).map((j) => (
              <div key={j.name} style={jointStyle}>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{j.name}</div>
                <div style={{ fontSize: '0.85rem' }}>{j.angle_deg.toFixed(1)}°</div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{j.torque_nm.toFixed(1)}Nm</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="EMG">
          {s?.emg && Object.entries(s.emg).map(([k, v]) => {
            const pct = Math.min(v, 100)
            const color = pct > 80 ? '#ff4444' : pct > 50 ? '#ffaa00' : '#00ff88'
            return (
              <div key={k} style={{ margin: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ color }}>{v.toFixed(1)}%</span>
                </div>
                <div style={barContainerStyle}>
                  <div style={{ ...barFillStyle, width: `${pct}%`, background: color }} />
                </div>
              </div>
            )
          })}
        </Card>

        <Card title="Event Stream">
          <div style={logStyle}>
            {history.map((e, i) => (
              <div key={i} style={{
                ...logEntryStyle,
                color: (e.threat_level || 0) >= 7 ? '#ff4444' : (e.threat_level || 0) >= 4 ? '#ffaa00' : '#888'
              }}>
                [{new Date(e.timestamp).toLocaleTimeString()}] {e.source}/{e.category} | threat={e.threat_level || 0}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#0a0a0f', color: '#00ff88', fontFamily: "'Segoe UI', monospace" }
const headerStyle: React.CSSProperties = { padding: '16px 24px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const headerTitleStyle: React.CSSProperties = { fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }
const statusDotStyle: React.CSSProperties = { width: 10, height: 10, borderRadius: '50%', display: 'inline-block', marginRight: 8 }
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, padding: 16 }
const cardStyle: React.CSSProperties = { background: '#111118', border: '1px solid #1a1a2e', borderRadius: 8, padding: 16 }
const cardTitleStyle: React.CSSProperties = { fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #1a1a2e' }
const metricStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f0f15' }
const metricLabelStyle: React.CSSProperties = { color: '#666', fontSize: '0.8rem' }
const metricValueStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: '0.9rem' }
const barContainerStyle: React.CSSProperties = { width: '100%', height: 6, background: '#1a1a2e', borderRadius: 3, marginTop: 4, overflow: 'hidden' }
const barFillStyle: React.CSSProperties = { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' }
const jointGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }
const jointStyle: React.CSSProperties = { background: '#0f0f15', padding: 8, borderRadius: 4, textAlign: 'center' }
const logStyle: React.CSSProperties = { maxHeight: 200, overflowY: 'auto', fontSize: '0.75rem', fontFamily: 'monospace' }
const logEntryStyle: React.CSSProperties = { padding: '2px 0', borderBottom: '1px solid #0f0f15' }
