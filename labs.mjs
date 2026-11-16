function finiteInRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be finite and between ${min} and ${max}`);
  }
}

export function actualRate(stick, { center, maxRate, expo }) {
  finiteInRange(stick, -1, 1, "stick");
  finiteInRange(center, 0, 1998, "center");
  finiteInRange(maxRate, center, 1998, "maxRate");
  finiteInRange(expo, 0, 1, "expo");
  const shaped = (1 - expo) * stick + expo * stick ** 5;
  return center * stick + (maxRate - center) * Math.abs(stick) * shaped;
}

export function simulatePid({ p, i, d, disturbance }) {
  finiteInRange(p, 0.5, 4, "p");
  finiteInRange(i, 0, 3, "i");
  finiteInRange(d, 0, 0.5, "d");
  if (typeof disturbance !== "boolean") {
    throw new TypeError("disturbance must be a boolean");
  }
  const dt = 0.002;
  const samples = [];
  let velocity = 0;
  let previousVelocity = 0;
  let integral = 0;
  let actuator = 0;
  let filteredDerivative = 0;
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

  for (let step = 0; step <= 3000; step += 1) {
    const time = step * dt;
    const target = time >= 0.5 ? 1 : 0;
    samples.push({ time, target, velocity });
    if (step === 3000) break;
    const error = target - velocity;
    integral = clamp(integral + error * dt, 1.8);
    const derivative = (velocity - previousVelocity) / dt;
    filteredDerivative += (derivative - filteredDerivative) * dt / (0.025 + dt);
    previousVelocity = velocity;
    const command = clamp(p * error + i * integral - d * filteredDerivative, 2.5);
    actuator += (command - actuator) * dt / 0.09;
    const wind = disturbance && time >= 3 ? -0.3 : 0;
    velocity += (actuator - 0.35 * velocity + wind) * dt * 5;
    if (!Number.isFinite(velocity)) {
      throw new Error("The educational PID model produced a non-finite response");
    }
  }
  return samples;
}
