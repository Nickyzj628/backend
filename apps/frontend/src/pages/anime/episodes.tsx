import { useSocket } from "@/etc/socket-context";
import { clsx, qs } from "@/helpers/string";
import { useMemo } from "preact/hooks";
import { Link, useLocation, useSearchParams } from "wouter-preact";

type EpisodesProps = {
    list?: string[];
    activeIndex?: number;
    disabled?: boolean;
};

type EpisodeProps = {
    label: string;
    value: number;
    disabled: boolean;
    onEpChange?: (ep: number) => void;
};

const Episode = ({
    label,
    value,
    disabled = false,
    onEpChange,
}: EpisodeProps) => {
    const [location] = useLocation();
    const [searchParams] = useSearchParams();
    const currentEp = Number(searchParams.get("ep")) || 1;

    const active = currentEp === value;
    const href = useMemo(() => {
        const params = {
            ...Object.fromEntries(searchParams),
            ep: value,
        };
        return `${location}?${qs.stringify(params)}`;
    }, [searchParams, value, location]);

    return (
        <Link
            href={href}
            replace
            className={clsx(
                "text-sm",
                active ? "dark:text-white" : "text-neutral-400",
                disabled ? "pointer-events-none opacity-50" : "hover:text-black dark:hover:text-white",
            )}
            onClick={() => onEpChange?.(value)}
        >
            {label}
        </Link>
    );
};

const Episodes = ({
    list = [],
    disabled = false,
}: EpisodesProps) => {
    const socket = useSocket();

    const onEpChange = (ep: number) => {
        socket.emit("epChange", ep);
    };

    return list.map((episode, i) => {
        const ep = i + 1;

        return (
            <Episode
                key={ep}
                label={episode}
                value={ep}
                disabled={disabled}
                onEpChange={onEpChange}
            />
        );
    });
};

export default Episodes;
