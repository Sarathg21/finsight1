import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    style = {},
    required = false,
    name = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const filteredOptions = options.filter(opt => 
        (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(opt.value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            ref={containerRef}
            className={`relative inline-block w-full ${className}`}
            style={style}
        >
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setSearchTerm('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all shadow-sm"
            >
                <span className={`text-[12px] truncate ${!selectedOption ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'}`}>
                    {displayLabel}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            
            {/* Hidden input to support required prop in forms */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ opacity: 0, height: 0, width: 0, position: 'absolute' }}
                    value={value || ''}
                    name={name}
                    onChange={() => {}}
                    required={required}
                />
            )}

            {isOpen && (
                <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                        <Search size={14} className="text-slate-400 shrink-0 ml-1" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-[12px] font-medium outline-none text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, idx) => (
                                <button
                                    key={`${option.value}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-colors ${
                                        String(value) === String(option.value)
                                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-100 font-medium hover:text-slate-900'
                                    }`}
                                >
                                    <span className="truncate pr-2">{option.label}</span>
                                    {String(value) === String(option.value) && <Check size={14} className="text-indigo-600 shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-center text-slate-400 text-[11px] font-medium italic">
                                No matching tasks found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
