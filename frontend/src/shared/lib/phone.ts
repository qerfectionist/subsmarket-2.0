export function formatKzPhone(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';

    const normalized = digits.startsWith('7') ? digits : `7${digits.slice(0, 10)}`;
    const visible = normalized.slice(0, 11);
    const parts = [
        visible.slice(1, 4),
        visible.slice(4, 7),
        visible.slice(7, 9),
        visible.slice(9, 11),
    ];

    let result = '+7';
    if (parts[0]) result += ` (${parts[0]}`;
    if (parts[0].length === 3) result += ')';
    if (parts[1]) result += ` ${parts[1]}`;
    if (parts[2]) result += `-${parts[2]}`;
    if (parts[3]) result += `-${parts[3]}`;

    return result;
}

export function isKzPhoneComplete(value: string) {
    return value.replace(/\D/g, '').length === 11;
}
