import { useState } from 'react';
import { COUNTRIES, DEFAULT_COUNTRY } from '../utils/countries';

// Renders a country dial-code dropdown + a plain number input, and reports
// the combined value (e.g. "+91 9876543210") to the parent via onChange.
export default function PhoneField({ value, onChange, required = true }) {
  const [dial, setDial] = useState(DEFAULT_COUNTRY.dial);
  const [number, setNumber] = useState(value || '');

  function emit(nextDial, nextNumber) {
    onChange(`${nextDial} ${nextNumber}`.trim());
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select
        aria-label="Country code"
        value={dial}
        onChange={(e) => {
          setDial(e.target.value);
          emit(e.target.value, number);
        }}
        style={{ width: 110, flexShrink: 0 }}
      >
        {COUNTRIES.map((c) => (
          <option key={c.iso2} value={c.dial}>
            {c.iso2} {c.dial}
          </option>
        ))}
      </select>
      <input
        required={required}
        type="tel"
        placeholder="Phone number"
        style={{ flex: 1 }}
        value={number}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/[^\d\s-]/g, '');
          setNumber(digitsOnly);
          emit(dial, digitsOnly);
        }}
      />
    </div>
  );
}
