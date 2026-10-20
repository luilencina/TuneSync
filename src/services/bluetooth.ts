import { BleClient } from "@capacitor-community/bluetooth-le";
import type {
  BleService,
  ScanResult,
} from "@capacitor-community/bluetooth-le";
import type { NearbyBluetoothDevice } from "../schemas/bluetooth";

let initialization: Promise<void> | null = null;
let isScanning = false;

export function initializeBluetooth() {
  initialization ??= BleClient.initialize({ androidNeverForLocation: true });
  return initialization;
}

export async function scanForBluetoothDevices(
  onDeviceFound: (device: NearbyBluetoothDevice) => void,
) {
  await initializeBluetooth();
  await stopBluetoothScan();

  await BleClient.requestLEScan({}, (result: ScanResult) => {
    const device = result.device;

    onDeviceFound({
      deviceId: device.deviceId,
      name: result.localName?.trim() || device.name?.trim() || "Dispositivo sem nome",
      rssi: result.rssi ?? null,
      advertisedServices: result.uuids ?? device.uuids ?? [],
    });
  });

  isScanning = true;
}

export async function stopBluetoothScan() {
  if (!isScanning) return;
  await BleClient.stopLEScan();
  isScanning = false;
}

export async function connectAndDiscoverServices(
  deviceId: string,
  onDisconnect: () => void,
): Promise<BleService[]> {
  await initializeBluetooth();
  await BleClient.connect(deviceId, onDisconnect);

  try {
    return await BleClient.getServices(deviceId);
  } catch (error) {
    await BleClient.disconnect(deviceId);
    throw error;
  }
}

export async function disconnectBluetoothDevice(deviceId: string) {
  await BleClient.disconnect(deviceId);
}
