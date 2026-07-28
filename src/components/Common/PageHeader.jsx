
export default function PageHeader({
    title,
    subtitle,
    children
}) {
    return (
        <div className="page-header">

            <div>
                <h1 className="page-header-title">
                    {title}
                </h1>

                <p className="page-header-subtitle">
                    {subtitle}
                </p>
            </div>

            <div className="topbar-actions">
                {children}
            </div>

        </div>

    );
}   