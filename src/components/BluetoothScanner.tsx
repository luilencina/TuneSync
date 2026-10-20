import { useEffect, useRef, useState } from "react";
import type {
  BluetoothDeviceRecord,
  NearbyBluetoothDevice,
} from "../schemas/bluetooth";
import {
  connectAndDiscoverServices,
  scanForBluetoothDevices,
  stopBluetoothScan,
  disconnectBluetoothDevice,
} from "../services/bluetooth";

const SCAN_DURATION_MS = 12_000;
const RECORDS_STORAGE_KEY = "tunesync-ble-discovery-records";

function loadRecords(): BluetoothDeviceRecord[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(RECORDS_STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(value)) return [];
    return value.filter(
      (record): record is BluetoothDeviceRecord =>
        typeof record === "object" &&
        record !== null &&
        "device" in record &&
        "services" in record &&
        Array.isArray(record.services),
    );
  } catch {
    return [];
  }
}

function formatUuid(uuid: string) {
  return uuid.toLowerCase();
}

export default function BluetoothScanner() {
  const [devices, setDevices] = useState<NearbyBluetoothDevice[]>([]);
  const [records, setRecords] = useState<BluetoothDeviceRecord[]>(loadRecords);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scanTimeout = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(
    () => () => {
      if (scanTimeout.current !== null) {
        window.clearTimeout(scanTimeout.current);
      }
      void stopBluetoothScan();
    },
    [],
  );

  function updateDevice(foundDevice: NearbyBluetoothDevice) {
    setDevices((current) => {
      const existingIndex = current.findIndex(
        (device) => device.deviceId === foundDevice.deviceId,
      );

      if (existingIndex === -1) return [...current, foundDevice];

      const next = [...current];
      next[existingIndex] = foundDevice;
      return next;
    });
  }

  async function handleScan() {
    setError(null);
    setDevices([]);
    setScanning(true);

    try {
      await scanForBluetoothDevices(updateDevice);
      scanTimeout.current = window.setTimeout(() => {
        void stopBluetoothScan()
          .then(() => setScanning(false))
          .catch((scanError: unknown) => {
            setScanning(false);
            setError(
              scanError instanceof Error
                ? scanError.message
                : "Não foi possível encerrar a busca Bluetooth.",
            );
          });
      }, SCAN_DURATION_MS);
    } catch (scanError) {
      setScanning(false);
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Não foi possível iniciar a busca por dispositivos BLE.",
      );
    }
  }

  async function handleStopScan() {
    if (scanTimeout.current !== null) {
      window.clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }

    try {
      await stopBluetoothScan();
      setScanning(false);
    } catch (scanError) {
      setScanning(false);
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Não foi possível encerrar a busca Bluetooth.",
      );
    }
  }

  async function handleConnect(device: NearbyBluetoothDevice) {
    setConnectingId(device.deviceId);
    setError(null);

    try {
      const services = await connectAndDiscoverServices(
        device.deviceId,
        () => {
          setConnectedId((current) =>
            current === device.deviceId ? null : current,
          );
        },
      );

      const record: BluetoothDeviceRecord = {
        device,
        services,
        discoveredAt: new Date().toISOString(),
      };

      setRecords((current) => [
        record,
        ...current.filter((item) => item.device.deviceId !== device.deviceId),
      ]);
      setConnectedId(device.deviceId);
      setExpandedId(device.deviceId);
    } catch (connectionError) {
      setError(
        connectionError instanceof Error
          ? connectionError.message
          : "Não foi possível conectar e ler os serviços deste dispositivo.",
      );
    } finally {
      setConnectingId(null);
    }
  }

  async function handleDisconnect(deviceId: string) {
    try {
      await disconnectBluetoothDevice(deviceId);
      setConnectedId(null);
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : "Não foi possível desconectar o dispositivo.",
      );
    }
  }

  function deleteRecord(deviceId: string) {
    setRecords((current) =>
      current.filter((record) => record.device.deviceId !== deviceId),
    );
    setExpandedId((current) => (current === deviceId ? null : current));
  }

  return (
    <section className="mt-5 rounded-[1.125rem] border border-foreground/10 bg-gradient-to-br from-surface-raised to-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[0.65rem] font-bold tracking-[0.16em] text-accent">
            BLUETOOTH LOW ENERGY
          </span>
          <h2 className="mt-1.5 font-semibold tracking-tight">
            Dispositivos próximos
          </h2>
        </div>
        <div className="flex gap-2">
          {scanning ? (
            <button
              className="min-h-10 rounded-[0.625rem] border border-foreground/15 px-3 text-xs text-text-subtle hover:bg-foreground/5"
              onClick={() => void handleStopScan()}
            >
              Parar busca
            </button>
          ) : (
            <button
              className="min-h-10 rounded-[0.625rem] bg-accent px-4 text-xs font-bold text-accent-foreground hover:bg-accent-bright"
              onClick={() => void handleScan()}
            >
              Buscar dispositivos
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        Busca por dispositivos Bluetooth Low Energy. Dispositivos Bluetooth
        clássico, como algumas centrais de áudio, não aparecem nesta busca.
      </p>

      {scanning && (
        <p className="mt-4 animate-pulse text-xs text-accent" role="status">
          Procurando dispositivos BLE por até 12 segundos…
        </p>
      )}

      {error && (
        <p
          className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger-light"
          role="alert"
        >
          {error}
        </p>
      )}

      {!scanning && devices.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-foreground/15 p-5 text-center text-sm text-text-dim">
          Toque em “Buscar dispositivos” e permita o acesso ao Bluetooth.
        </div>
      )}

      {devices.length > 0 && (
        <ul className="mt-5 grid gap-3">
          {devices.map((device) => {
            const record = records.find(
              (item) => item.device.deviceId === device.deviceId,
            );
            const connected = connectedId === device.deviceId;

            return (
              <li
                key={device.deviceId}
                className="rounded-xl border border-foreground/10 bg-background/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {device.name}
                    </h3>
                    <p className="mt-1 break-all font-mono text-[0.65rem] text-text-disabled">
                      {device.deviceId}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Sinal: {device.rssi === null ? "indisponível" : `${device.rssi} dBm`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connected ? (
                      <button
                        className="min-h-9 rounded-lg border border-foreground/15 px-3 text-xs text-text-subtle hover:bg-foreground/5"
                        onClick={() => void handleDisconnect(device.deviceId)}
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button
                        className="min-h-9 rounded-lg border border-accent/30 px-3 text-xs text-accent hover:bg-accent/10 disabled:opacity-60"
                        disabled={connectingId !== null}
                        onClick={() => void handleConnect(device)}
                      >
                        {connectingId === device.deviceId
                          ? "Conectando…"
                          : record
                            ? "Redescobrir serviços"
                            : "Conectar e descobrir"}
                      </button>
                    )}
                  </div>
                </div>

                {device.advertisedServices.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text-disabled">
                      Serviços anunciados
                    </p>
                    <ul className="mt-1 grid gap-1">
                      {device.advertisedServices.map((uuid) => (
                        <li
                          className="break-all font-mono text-[0.65rem] text-text-dim"
                          key={uuid}
                        >
                          {formatUuid(uuid)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {record && (
                  <div className="mt-3 border-t border-foreground/10 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        className="text-xs font-semibold text-accent hover:underline"
                        aria-expanded={expandedId === device.deviceId}
                        onClick={() =>
                          setExpandedId((current) =>
                            current === device.deviceId ? null : device.deviceId,
                          )
                        }
                      >
                        {expandedId === device.deviceId
                          ? "Ocultar descoberta"
                          : `Ver descoberta salva (${record.services.length} serviços)`}
                      </button>
                      <button
                        className="text-xs text-text-disabled hover:text-danger-light"
                        onClick={() => deleteRecord(device.deviceId)}
                      >
                        Apagar registro
                      </button>
                    </div>

                    {expandedId === device.deviceId && (
                      <div className="mt-3 grid gap-3">
                        {record.services.length === 0 ? (
                          <p className="text-xs text-text-disabled">
                            Nenhum serviço foi informado pelo dispositivo.
                          </p>
                        ) : (
                          record.services.map((service) => (
                            <section
                              className="rounded-lg border border-foreground/10 p-3"
                              key={service.uuid}
                            >
                              <h4 className="break-all font-mono text-xs text-accent">
                                Serviço {formatUuid(service.uuid)}
                              </h4>
                              {service.characteristics.length === 0 ? (
                                <p className="mt-2 text-xs text-text-disabled">
                                  Sem características.
                                </p>
                              ) : (
                                <ul className="mt-2 grid gap-2">
                                  {service.characteristics.map(
                                    (characteristic) => (
                                      <li
                                        className="border-l border-accent/30 pl-3"
                                        key={characteristic.uuid}
                                      >
                                        <p className="break-all font-mono text-[0.7rem] text-text-primary">
                                          {formatUuid(characteristic.uuid)}
                                        </p>
                                        <p className="mt-1 text-[0.65rem] text-text-disabled">
                                          {Object.entries(
                                            characteristic.properties,
                                          )
                                            .filter(([, supported]) => supported)
                                            .map(([property]) => property)
                                            .join(", ") || "Sem propriedades"}
                                        </p>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </section>
                          ))
                        )}
                        <p className="text-[0.65rem] text-text-disabled">
                          Descoberto em{" "}
                          {new Date(record.discoveredAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {records.length > 0 && devices.length === 0 && (
        <div className="mt-6 border-t border-foreground/10 pt-5">
          <h3 className="text-xs font-semibold text-text-primary">
            Descobertas salvas neste dispositivo ({records.length})
          </h3>
          <ul className="mt-3 grid gap-2">
            {records.map((record) => (
              <li
                className="flex items-center justify-between gap-3 rounded-lg bg-background/50 p-3"
                key={record.device.deviceId}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">
                    {record.device.name}
                  </span>
                  <span className="font-mono text-[0.6rem] text-text-disabled">
                    {record.services.length} serviços ·{" "}
                    {record.services.reduce(
                      (count, service) =>
                        count + service.characteristics.length,
                      0,
                    )}{" "}
                    características
                  </span>
                </span>
                <button
                  className="text-xs text-accent hover:underline"
                  onClick={() => {
                    setDevices([record.device]);
                    setExpandedId(record.device.deviceId);
                  }}
                >
                  Abrir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
