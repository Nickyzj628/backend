import { qs } from "@nickyzj2023/utils";
import { useMemo } from "preact/hooks";
import { useRouterStore } from "@/stores/router";
import { clsx } from "@/utils/string";
import { useWebSocketContext } from "@/utils/websocket-context";

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

const Episode = ({ label, value, disabled = false, onEpChange }: EpisodeProps) => {
  const { path, search } = useRouterStore();

  const currentEp = Number(search.ep || 1);

  const active = currentEp === value;
  const href = useMemo(() => {
    const newSearch = {
      ...search,
      ep: value,
    };
    return `${path}?${qs.stringify(newSearch)}`;
  }, [search, value, path]);

  return (
    <a
      href={href}
      className={clsx(
        "text-sm",
        active ? "dark:text-white" : "text-neutral-400",
        disabled ? "pointer-events-none opacity-50" : "hover:text-black dark:hover:text-white",
      )}
      onClick={() => {
        onEpChange?.(value);
      }}
    >
      {label}
    </a>
  );
};

const Episodes = ({ list = [], disabled = false }: EpisodesProps) => {
  const { send } = useWebSocketContext();

  const onEpChange = (ep: number) => {
    send("epChange", ep);
  };

  return list.map((episode, i) => {
    const ep = i + 1;

    return (
      <Episode key={ep} label={episode} value={ep} disabled={disabled} onEpChange={onEpChange} />
    );
  });
};

export default Episodes;
