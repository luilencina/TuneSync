import type { BleService } from "@capacitor-community/bluetooth-le";

export type NearbyBluetoothDevice = {
  deviceId: string;
  name: string;
  rssi: number | null;
  advertisedServices: string[];
};

export type BluetoothDeviceRecord = {
  device: NearbyBluetoothDevice;
  services: BleService[];
  discoveredAt: string;
};
