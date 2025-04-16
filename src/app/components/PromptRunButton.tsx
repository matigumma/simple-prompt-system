"use client";
import React from "react";

type PromptRunButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
};

const PromptRunButton: React.FC<PromptRunButtonProps> = ({ onClick, disabled, loading }) => (
    <button
        className="btn btn-soft btn-success btn-wide"
        onClick={onClick}
        disabled={disabled || loading}
        type="button"
    >
        {loading ? (
            <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
                Running...
            </span>
        ) : (
            <>Enviar Prompt &rarr;</>
        )}
    </button>
);

export default PromptRunButton;
