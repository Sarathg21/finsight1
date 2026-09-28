
import React from "react";

export default function PageHeader({
    title,
    subtitle,
    children,
    buttonText,
    buttonIcon: ButtonIcon,
    onButtonClick,
}) {
    return (
        <div
            className="page-header"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: "20px",
            }}
        >
            {/* Left Side */}
            <div style={{ minWidth: 0 }}>
                <h1
                    className="page-header-title"
                    style={{
                        margin: 0,
                    }}
                >
                    {title}
                </h1>

                <p
                    className="page-header-subtitle"
                    style={{
                        margin: "4px 0 0 0",
                    }}
                >
                    {subtitle}
                </p>
            </div>

            {/* Right Side */}
            <div
                className="topbar-actions"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexShrink: 0,
                    gap: "10px",
                }}
            >
                {children}

                {buttonText && (
                    <button
                        type="button"
                        onClick={onButtonClick}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {ButtonIcon && (
                            <ButtonIcon
                                size={18}
                                strokeWidth={2}
                            />
                        )}

                        <span>{buttonText}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

