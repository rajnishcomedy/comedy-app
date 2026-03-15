import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 16, color = "var(--accent)" }) => (
    <Loader2 size={size} color={color} className="spin" />
);
