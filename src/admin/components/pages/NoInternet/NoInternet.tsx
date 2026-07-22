"use client";

import React from "react";
import Icon from "@admin/components/core/Icon/Icon";

const NoInternet = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900 flex items-center justify-center px-4">
            {/* Background blur circles */}
            <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative w-full max-w-xl rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-lg p-8 md:p-10 text-center">
                {/* Illustration */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-500/10 blur-2xl scale-110" />
                        <div className="relative w-52 h-52 md:w-60 md:h-60">
                            <svg
                                viewBox="0 0 300 300"
                                className="w-full h-full"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="150" cy="150" r="120" fill="url(#bgGradient)" />
                                <circle cx="150" cy="150" r="95" fill="white" fillOpacity="0.95" />
                                <path
                                    d="M98 170C110 138 128 122 150 122C172 122 190 138 202 170"
                                    stroke="#3B82F6"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M118 188C126 166 137 154 150 154C163 154 174 166 182 188"
                                    stroke="#60A5FA"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M138 206C142 196 146 192 150 192C154 192 158 196 162 206"
                                    stroke="#93C5FD"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="92"
                                    y1="92"
                                    x2="208"
                                    y2="208"
                                    stroke="#EF4444"
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                                <circle cx="150" cy="220" r="10" fill="#EF4444" />
                                <defs>
                                    <linearGradient id="bgGradient" x1="60" y1="60" x2="240" y2="240">
                                        <stop stopColor="#DBEAFE" />
                                        <stop offset="1" stopColor="#C7D2FE" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-2 mb-5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        Network Disconnected
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    No Internet Connection
                </h1>

                {/* Description */}
                <p className="mt-3 text-sm md:text-base leading-7 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Your device is currently offline. Please check your Wi-Fi or mobile
                    network and try again.
                </p>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold shadow-sm shadow-blue-500/200 transition-all duration-200"
                    >
                        <Icon name="refresh" />
                        Retry
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 px-6 py-3 font-semibold transition-all duration-200"
                    >
                        <Icon name="arrow_back" />
                        Go Back
                    </button>
                </div>

                {/* Footer note */}
                <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                    Please reconnect to continue browsing the website.
                </p>
            </div>
        </div>
    );
};

export default NoInternet;