import React, { useState, useEffect } from 'react'
import { SketchPicker } from 'react-color'
import { useSnapshot } from 'valtio'

import state from '../store';

const ColorPicker = () => {
  const snap = useSnapshot(state);
  const [inputValue, setInputValue] = useState(snap.color);

  // Synchronize input value with state color
  useEffect(() => {
    setInputValue(snap.color);
  }, [snap.color]);

  const handleHexChange = (e) => {
    let value = e.target.value;
    
    // Auto prepend hash if omitted
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    setInputValue(value);

    // Apply color if it is a valid 3 or 6 digit hex code
    if (/^#[0-9A-F]{6}$/i.test(value) || /^#[0-9A-F]{3}$/i.test(value)) {
      state.color = value;
    }
  };

  return (
    <div className="absolute left-full ml-3 flex flex-col gap-2 p-2 bg-white/30 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
      <SketchPicker 
        color={snap.color}
        disableAlpha
        onChange={(color) => {
          state.color = color.hex;
          setInputValue(color.hex);
        }}
      />
      
      {/* Custom Premium Hex Code Input */}
      <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-md border border-gray-200 shadow-sm">
        <span className="text-[10px] font-bold text-gray-400 font-mono">HEX</span>
        <input 
          type="text" 
          value={inputValue}
          onChange={handleHexChange}
          placeholder="#FFFFFF"
          className="w-full bg-transparent text-xs font-mono font-bold uppercase outline-none text-gray-800"
          maxLength={7}
        />
        <div 
          className="w-4 h-4 rounded border border-black/10 shadow-inner flex-shrink-0 transition-colors duration-250"
          style={{ backgroundColor: snap.color }}
        />
      </div>
    </div>
  )
}

export default ColorPicker