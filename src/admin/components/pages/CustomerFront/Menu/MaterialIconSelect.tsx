"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";


type MaterialIconSelectProps = {
    value?: string;
    onChange: (value: string) => void;
    options: any[];
    placeholder?: string;
};

const MaterialIconSelect: React.FC<MaterialIconSelectProps> = ({
    value = "",
    onChange,
    options,
    placeholder = "Select Material Icon",
}) => {
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const filteredOptions = useMemo(() => {
        if (!searchText.trim()) return options;

        return options.filter((item) =>
            item.label.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [options, searchText]);

    const selectedOption = useMemo(() => {
        return options.find((item) => item.value === value) || null;
    }, [options, value]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white flex items-center justify-between"
            >
                <div className="flex items-center gap-2 min-w-0">
                    {selectedOption ? (
                        <>
                            <Icon name={selectedOption.value} />
                            <span className="truncate text-left">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <Icon name={open ? "expand_less" : "expand_more"} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-[9999] overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search icon..."
                            className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(item.value);
                                        setOpen(false);
                                        setSearchText("");
                                    }}
                                    className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${value === item.value ? "bg-gray-100 dark:bg-gray-800" : ""
                                        }`}
                                >
                                    <Icon name={item.value} />
                                    <span className="text-sm text-gray-800 dark:text-white">
                                        {item.label}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-sm text-gray-500">
                                No icon found
                            </div>
                        )}
                    </div>

                    {value ? (
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                                className="w-full px-3 py-2 border rounded-lg text-sm text-red-500 border-red-200 hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-500/10"
                            >
                                Clear
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default MaterialIconSelect;