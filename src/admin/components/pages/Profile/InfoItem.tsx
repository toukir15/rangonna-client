const InfoItem = ({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) => {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {label}
            </p>
            <div className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
                {value}
            </div>
        </div>
    );
};
export default InfoItem;