'use server'

import si from 'systeminformation'

export interface VPSStats {
  cpu: {
    manufacturer: string
    brand: string
    speed: number
    cores: number
    physicalCores: number
    load: number
  }
  mem: {
    total: number
    free: number
    used: number
    active: number
    available: number
  }
  os: {
    platform: string
    distro: string
    release: string
    arch: string
    hostname: string
  }
  disk: {
    fs: string
    type: string
    size: number
    used: number
    use: number
    mount: string
  }[]
  uptime: number
}

export async function getVPSStats(): Promise<VPSStats> {
  const [cpu, mem, os, disk, currentLoad, time] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.fsSize(),
    si.currentLoad(),
    si.time()
  ])

  return {
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      load: currentLoad.currentLoad
    },
    mem: {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active,
      available: mem.available
    },
    os: {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      arch: os.arch,
      hostname: os.hostname
    },
    disk: disk.map(d => ({
      fs: d.fs,
      type: d.type,
      size: d.size,
      used: d.used,
      use: d.use,
      mount: d.mount
    })),
    uptime: time.uptime
  }
}
