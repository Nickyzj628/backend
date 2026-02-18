import dayjs from "dayjs";
import { useMemo } from "preact/hooks";
import { Link } from "wouter-preact";
import { Figcaption, Figure } from "@/components/figure";
import Loading from "@/components/loading";
import Section from "@/components/section";
import Timeline from "@/components/timeline";
import { clsx } from "@/helpers/string";
import { useAnimes } from "@/hooks/store/use-anime";

type GroupedAnimes = (Anime & {
	dayDiff: number;
	dayDiffLocale: string;
})[][];

const DAY_DIFF_LOCALE_STRINGS = ["今天", "昨天", "前天"];

const RecentAnimes = () => {
	const { isLoading, error, data } = useAnimes();
	const animes = data?.list ?? [];

	const dayDiffToLocaleString = (dayDiff: number) => {
		if (dayDiff >= DAY_DIFF_LOCALE_STRINGS.length) {
			return `${dayDiff}天前`;
		}
		return DAY_DIFF_LOCALE_STRINGS[dayDiff];
	};

	const groupedAnimes = useMemo<GroupedAnimes>(() => {
		if (!animes || animes.length === 0) {
			return [];
		}

		const now = dayjs();
		return animes
			.reduce((result, anime) => {
				const dayDiff = now.diff(dayjs(anime.updated_at), "day");
				if (!result[dayDiff]) {
					result[dayDiff] = [];
				}
				result[dayDiff].push({
					...anime,
					dayDiff,
					dayDiffLocale: dayDiffToLocaleString(dayDiff),
				});
				return result;
			}, [] as GroupedAnimes)
			.filter((group) => !!group);
	}, [animes]);

	return (
		<Section className="flex flex-col flex-1 gap-1.5 min-w-72 w-full sm:w-80 lg:w-96 h-[36rem] mt-2">
			<Section.Title className="text-yellow-300">本季新番</Section.Title>
			<div
				className={clsx(
					"relative flex flex-col flex-1 p-3 text-zinc-400 rounded-xl bg-zinc-100 overflow-x-hidden transition dark:text-zinc-500 dark:bg-zinc-800",
					groupedAnimes.length === 0 && "items-center justify-center",
				)}
			>
				{isLoading && <Loading />}
				{error && (
					<div className="flex flex-col items-center">
						<div className="icon-[mingcute--pic-line] size-32" />
						<p>{error.message}</p>
					</div>
				)}
				{groupedAnimes.map((group) => (
					<Timeline key={group[0].dayDiff} time={group[0].dayDiffLocale}>
						{group.map((anime) => (
							<Link
								key={anime.title}
								href={`/animes/${anime.slug}?ep=${anime.eps}`}
							>
								<Figure className="max-w-36 aspect-[2/3]">
									<Figure.Image
										src={`/animes/${anime.title}.webp`}
										alt={anime.title}
									/>
									<Figcaption>
										<Figcaption.Title className="text-base line-clamp-2">
											{anime.title}
										</Figcaption.Title>
										<Figcaption.Description>
											{`第${anime.eps}话`}
										</Figcaption.Description>
									</Figcaption>
								</Figure>
							</Link>
						))}
					</Timeline>
				))}
			</div>
		</Section>
	);
};

export default RecentAnimes;
