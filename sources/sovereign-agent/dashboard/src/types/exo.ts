/** Exoskeleton telemetry types — mirror of exo_controller.py dataclasses */

export interface JointState {
  name: string;
  angle_deg: number;
  torque_nm: number;
  speed_deg_s: number;
  load_pct: number;
  limit_reached: boolean;
}

export interface EMGReading {
  quadriceps_l: number;
  quadriceps_r: number;
  hamstrings_l: number;
  hamstrings_r: number;
  deltoid_l: number;
  deltoid_r: number;
  biceps_l: number;
  biceps_r: number;
}

export interface IMUReading {
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
}

export interface PressureReading {
  insole_l: number;
  insole_r: number;
  glove_l: number;
  glove_r: number;
}

export interface BiomechanicalReading {
  timestamp: string;
  emg: EMGReading;
  imu: IMUReading;
  pressure: PressureReading;
  heart_rate_bpm: number;
  posture_score: number;
  gait_phase: 'stance' | 'swing' | 'transition';
}

export interface ActuatorCommand {
  joint: string;
  target_angle_deg: number;
  assist_level_pct: number;
  response_time_ms: number;
}

export interface PowerCell {
  cell_id: string;
  capacity_wh: number;
  remaining_wh: number;
  voltage_v: number;
  current_a: number;
  temperature_c: number;
  cycle_count: number;
  status: 'active' | 'charging' | 'standby' | 'fault';
}

export interface ExoFrame {
  frame_id: string;
  model: string;
  status: 'standby' | 'active' | 'locked' | 'emergency';
  wearer_id: string;
  joints: JointState[];
  sensors?: BiomechanicalReading;
  actuators: ActuatorCommand[];
  power_cells: PowerCell[];
  total_assist_lower_n: number;
  total_assist_upper_n: number;
  last_heartbeat?: string;
  aegentis_node: 'OFFEND' | 'RECON' | 'INFIL' | 'DEFEND';
}

export interface SafetyCheck {
  flags: string[];
  severity: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  emergency_release: boolean;
}

export interface DashboardEvent {
  type: 'event' | 'alert' | 'history' | 'pong' | 'stats';
  timestamp: string;
  source?: string;
  category?: string;
  threat_level?: number;
  data?: ExoFrame & { safety?: SafetyCheck };
  message?: string;
}
