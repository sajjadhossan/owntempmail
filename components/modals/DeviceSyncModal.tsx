'use client';

import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Tablet, X, RefreshCw, Trash2, Check, ShieldCheck, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { DeviceSession, getOrCreateDeviceId } from '@/lib/device-sync';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onForceSync: () => void;
  lang: string;
}

export default function DeviceSyncModal({
  isOpen,
  onClose,
  userId,
  onForceSync,
  lang,
}: DeviceSyncModalProps) {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const currentDeviceId = getOrCreateDeviceId();

  const fetchDevices = () => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`/api/sync/devices?userId=${encodeURIComponent(userId)}&currentDeviceId=${encodeURIComponent(currentDeviceId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.devices) {
          setDevices(data.data.devices);
        }
      })
      .catch((e: any) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleRevoke = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/sync/devices?userId=${encodeURIComponent(userId)}&deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
        setSyncMsg(lang === 'bn' ? 'ডিভাইস সেশন ডিসকানেক্ট করা হয়েছে!' : 'Device disconnected successfully!');
        setTimeout(() => setSyncMsg(null), 2500);
      }
    } catch (e) {}
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-purple-400" />;
      default:
        return <Laptop className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-1.5">
                <span>{lang === 'bn' ? 'কানেক্টেড ডিভাইস ম্যানেজার' : 'Connected Devices Hub'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800 uppercase">
                  Supabase Realtime
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'আপনার অ্যাকাউন্টের সাথে যুক্ত সকল সেশন ও রিয়েল-টাইম সিঙ্ক স্ট্যাটাস'
                  : 'Active cross-device sessions synced in real-time'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Action Alert */}
        {syncMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{syncMsg}</span>
          </div>
        )}

        {/* Devices List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-1">
              <Laptop className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
              <p>{lang === 'bn' ? 'কোনো ডিভাইস সেশন পাওয়া যায়নি' : 'No active device sessions found'}</p>
            </div>
          ) : (
            devices.map((device) => {
              const isCurrent = device.deviceId === currentDeviceId;
              return (
                <div
                  key={device.deviceId}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-slate-950/90 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate">{device.deviceName}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 shrink-0">
                            {lang === 'bn' ? 'বর্তমান ডিভাইস' : 'This Device'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {device.os} • {device.browser} • {new Date(device.lastActiveAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active & Synced"></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRevoke(device.deviceId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title={lang === 'bn' ? 'এই ডিভাইস ডিসকানেক্ট করুন' : 'Disconnect this device'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onForceSync();
              fetchDevices();
              setSyncMsg(lang === 'bn' ? '⚡ সকল ডিভাইসের সাথে লাইভ সিঙ্ক সম্পন্ন হয়েছে!' : '⚡ Synced state with all connected devices!');
              setTimeout(() => setSyncMsg(null), 2500);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{lang === 'bn' ? 'লাইভ সিঙ্ক করুন' : 'Sync All Devices'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
