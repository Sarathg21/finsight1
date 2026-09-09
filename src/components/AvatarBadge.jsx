export default function AvatarBadge({ initials = "", className = "" }) {
    return (
        <div
            className={`flex h-13 w-13 items-center justify-center rounded-full bg-blue-600 
        text-lg font-semibold text-white ${className}`}
        >
            {initials}
        </div>
    );
}