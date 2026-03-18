'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mic,
  Video,
  Bell,
  Database,
  Key,
  Save,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

interface SettingSection {
  id: string;
  label: string;
  labelJp: string;
  icon: React.ElementType;
}

const sections: SettingSection[] = [
  { id: 'profile', label: 'Perfil', labelJp: 'プロフィール', icon: User },
  { id: 'audio', label: 'Audio', labelJp: 'オーディオ', icon: Mic },
  { id: 'video', label: 'Video', labelJp: 'ビデオ', icon: Video },
  { id: 'alerts', label: 'Alertas', labelJp: 'アラート', icon: Bell },
  { id: 'data', label: 'Datos', labelJp: 'データ', icon: Database },
  { id: 'api', label: 'API Keys', labelJp: 'APIキー', icon: Key },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        enabled ? 'bg-accent-primary' : 'bg-bg-elevated'
      )}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  // Settings state
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('America/Mexico_City');
  const [audioLang, setAudioLang] = useState('es');
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [videoAutoAdjust, setVideoAutoAdjust] = useState(false);
  const [alertLowStock, setAlertLowStock] = useState(true);
  const [alertVerification, setAlertVerification] = useState(true);
  const [alertUnusual, setAlertUnusual] = useState(true);
  const [alertPush, setAlertPush] = useState(false);

  const handleSave = () => {
    toast.success('Configuración guardada');
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">05 · 設定</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Configuración</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section nav */}
        <nav className="lg:col-span-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-left',
                  activeSection === section.id
                    ? 'bg-bg-card text-accent-primary'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <div>
                  <span className="font-medium">{section.label}</span>
                  <span className="text-[10px] font-mono text-text-tertiary ml-2">{section.labelJp}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-6"
          >
            {/* Profile */}
            {activeSection === 'profile' && (
              <>
                <h3 className="font-semibold">Perfil del Negocio</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Nombre del negocio</label>
                    <input
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Mi Negocio"
                      className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Zona horaria</label>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                    >
                      <option value="America/Mexico_City">México (GMT-6)</option>
                      <option value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</option>
                      <option value="America/Bogota">Colombia (GMT-5)</option>
                      <option value="Europe/Madrid">España (GMT+1)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Audio */}
            {activeSection === 'audio' && (
              <>
                <h3 className="font-semibold">Configuración de Audio</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Idioma de transcripción</label>
                    <select
                      value={audioLang}
                      onChange={e => setAudioLang(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Confirmar siempre</p>
                      <p className="text-xs text-text-tertiary">Pedir confirmación incluso con alta confianza</p>
                    </div>
                    <Toggle enabled={autoConfirm} onChange={setAutoConfirm} />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">
                      Umbral de confianza: {Math.round(confidenceThreshold * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.3}
                      max={1}
                      step={0.05}
                      value={confidenceThreshold}
                      onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-full accent-accent-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Video */}
            {activeSection === 'video' && (
              <>
                <h3 className="font-semibold">Configuración de Video</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Calidad de captura</label>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as const).map(q => (
                        <button
                          key={q}
                          onClick={() => setVideoQuality(q)}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-sm transition-colors',
                            videoQuality === q
                              ? 'bg-accent-primary text-text-on-accent'
                              : 'bg-bg-elevated text-text-secondary hover:bg-bg-card-hover'
                          )}
                        >
                          {q === 'high' ? 'Alta' : q === 'medium' ? 'Media' : 'Baja'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-ajustar stock</p>
                      <p className="text-xs text-text-tertiary">Ajustar automáticamente al verificar</p>
                    </div>
                    <Toggle enabled={videoAutoAdjust} onChange={setVideoAutoAdjust} />
                  </div>
                </div>
              </>
            )}

            {/* Alerts */}
            {activeSection === 'alerts' && (
              <>
                <h3 className="font-semibold">Notificaciones y Alertas</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Stock bajo', desc: 'Cuando un producto llega al mínimo', enabled: alertLowStock, set: setAlertLowStock },
                    { label: 'Diferencia en verificación', desc: 'Cuando la verificación por video detecta diferencia', enabled: alertVerification, set: setAlertVerification },
                    { label: 'Movimiento inusual', desc: 'Cantidades mayores al promedio', enabled: alertUnusual, set: setAlertUnusual },
                    { label: 'Notificaciones push', desc: 'Recibir alertas del navegador', enabled: alertPush, set: setAlertPush },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-text-tertiary">{item.desc}</p>
                      </div>
                      <Toggle enabled={item.enabled} onChange={item.set} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Data */}
            {activeSection === 'data' && (
              <>
                <h3 className="font-semibold">Gestión de Datos</h3>
                <div className="space-y-3">
                  <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Exportar todo (CSV)
                  </button>
                  <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Importar productos (CSV)
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-status-error/30 text-status-error text-sm hover:bg-status-error/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Borrar todos los datos
                  </button>
                </div>
              </>
            )}

            {/* API Keys */}
            {activeSection === 'api' && (
              <>
                <h3 className="font-semibold">API Keys</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm font-mono focus:outline-none focus:border-accent-primary transition-colors"
                    />
                    <p className="text-[10px] text-text-tertiary mt-1.5">
                      Necesaria para transcripción por audio (Whisper) y análisis por video (GPT-4o Vision).
                      Obtén tu key en platform.openai.com
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <div className="pt-4 border-t border-border-subtle">
              <button onClick={handleSave} className="btn-accent text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar cambios
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
