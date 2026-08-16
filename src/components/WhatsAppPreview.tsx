import React from 'react';
import { CheckCheck, ShieldAlert, Smartphone } from 'lucide-react';

interface WhatsAppPreviewProps {
  phoneNumber: string;
  countryCode: string;
  messageText: string;
  timestamp?: string;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  phoneNumber,
  countryCode,
  messageText,
  timestamp = '21:52'
}) => {
  const formattedPhone = `${countryCode} ${phoneNumber.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2 $3')}`;

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-[2.5rem] p-3 border-4 border-slate-700 shadow-2xl relative">
      
      {/* Smartphone Top Camera Notch */}
      <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700"></div>
      </div>

      {/* Phone Screen Container */}
      <div className="bg-[#0b141a] rounded-[1.8rem] overflow-hidden border border-slate-800 text-slate-100 font-sans min-h-[460px] flex flex-col justify-between">
        
        {/* WhatsApp App Header */}
        <div className="bg-[#202c33] px-3.5 py-3 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center space-x-1">
                <span>MeteoAntofagasta Bot</span>
                <span className="w-3.5 h-3.5 bg-sky-500 rounded-full text-[9px] flex items-center justify-center text-slate-950 font-extrabold">✓</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Meta WhatsApp Business API</div>
            </div>
          </div>

          <div className="text-[10px] bg-[#111b21] px-2 py-0.5 rounded text-slate-400 font-mono">
            {formattedPhone}
          </div>
        </div>

        {/* Chat Background with Message Bubbles */}
        <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Info pill badge */}
          <div className="text-center">
            <span className="inline-block bg-[#182229] text-[9.5px] text-slate-400 px-3 py-1 rounded-lg border border-[#222d34]">
              🔒 Los mensajes están cifrados de extremo a extremo.
            </span>
          </div>

          {/* Incoming Alert Bubble */}
          <div className="max-w-[92%] bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-none border border-[#2a3942] shadow-lg text-xs leading-relaxed font-sans space-y-2">
            
            <div className="whitespace-pre-wrap font-sans text-slate-200">
              {messageText}
            </div>

            <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-400 pt-1 font-mono">
              <span>{timestamp}</span>
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            </div>

          </div>

        </div>

        {/* WhatsApp Footer Input Simulation */}
        <div className="bg-[#202c33] p-2 flex items-center justify-between border-t border-[#2a3942] text-[11px] text-slate-400">
          <span className="bg-[#111b21] px-3 py-1.5 rounded-full flex-1 mr-2 text-slate-500">
            Respuesta deshabilitada (Mensaje oficial de plantilla)
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            ➤
          </div>
        </div>

      </div>

    </div>
  );
};
