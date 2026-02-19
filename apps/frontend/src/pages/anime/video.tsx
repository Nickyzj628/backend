import type {
	RoomMessage,
	VideoInfo,
	VideoSyncRequestPayload,
} from "@nickyzj/shared-types";
import Danmaku from "danmaku/dist/esm/danmaku.canvas.js";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { toast } from "react-hot-toast/headless";
import { useSearchParams } from "wouter-preact";
import { useWebSocketContext } from "@/etc/websocket-context";
import { getAnimeVideoByEp, to } from "@/helpers/network";
import { throttle } from "@/helpers/time";

type Props = {
	anime: Anime;
	isHost?: boolean;
};

const Video = ({ anime, isHost = true }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const ep = Number(searchParams.get("ep")) || 1;

	const { send, on, off } = useWebSocketContext();

	const containerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	/**
	 * 弹幕发射逻辑
	 */

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const danmaku = new Danmaku({
			container,
			engine: "canvas",
			speed: 144,
		});

		const onRoomMessage = (payload: unknown) => {
			const message = payload as RoomMessage;
			const text = message.text || "";

			// 防御性检查：截断超长弹幕，防止 Canvas 尺寸超限
			const MAX_LENGTH = 80;
			const displayText =
				text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}...` : text;

			if (!displayText) return;

			danmaku.emit({
				text: displayText,
				style: {
					font: "20px sans-serif",
					fillStyle: "#ffffff",
					strokeStyle: "rgba(0, 0, 0, 0.8)",
					lineWidth: 2,
					textAlign: "start",
					textBaseline: "middle",
				},
			});
		};
		on("roomMessage", onRoomMessage);

		return () => {
			off("roomMessage", onRoomMessage);
			danmaku.destroy();
		};
	}, [on, off]);

	/**
	 * 单机视频控制逻辑
	 */

	const loadVolume = () => {
		videoRef.current.volume = parseFloat(
			localStorage.getItem("volume") ?? "0.5",
		);
	};

	const saveVolume = () => {
		localStorage.setItem("volume", videoRef.current.volume.toString());
	};

	useEffect(() => {
		const { current: video } = videoRef;
		if (!video) return;

		loadVolume();
		video.addEventListener("volumechange", saveVolume);

		return () => {
			video.removeEventListener("volumechange", saveVolume);
		};
	}, []);

	/**
	 * 房主视频控制逻辑
	 */

	const playTogether = () => {
		send("play");
	};

	const pauseTogether = () => {
		send("pause");
	};

	const seekTogether = () => {
		send("seek", videoRef.current.currentTime);
	};

	const rateChangeTogether = useCallback(
		throttle(() => {
			send("rateChange", videoRef.current.playbackRate);
		}),
		[send],
	);

	const videoSyncRequest = (payload: unknown) => {
		const { requesterId } = payload as VideoSyncRequestPayload;
		const video = videoRef.current;
		send("videoSyncResponse", {
			targetId: requesterId,
			currentTime: video.currentTime,
			playbackRate: video.playbackRate,
			paused: video.paused,
		});
	};

	useEffect(() => {
		const { current: video } = videoRef;
		if (!isHost || !video) {
			return;
		}

		video.addEventListener("play", playTogether);
		video.addEventListener("pause", pauseTogether);
		video.addEventListener("seeked", seekTogether);
		video.addEventListener("ratechange", rateChangeTogether);
		on("videoSyncRequest", videoSyncRequest);

		return () => {
			video.removeEventListener("play", playTogether);
			video.removeEventListener("pause", pauseTogether);
			video.removeEventListener("seeked", seekTogether);
			video.removeEventListener("ratechange", rateChangeTogether);
			off("videoSyncRequest", videoSyncRequest);
		};
	}, [isHost, send, on, off]);

	/**
	 * 观众视频被控逻辑
	 */

	// 视频被房主播放前，用户必须和页面有过交互
	// 原因：play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
	const [needInteract, setNeedInteract] = useState(false);

	const bePlayed = async () => {
		const video = videoRef.current;
		if (!video.paused) {
			return;
		}

		const [err] = await to(video.play());
		if (err && err.name === "NotAllowedError") {
			setNeedInteract(true);
		} else {
			toast("房主播放了视频");
		}
	};

	const bePaused = () => {
		const video = videoRef.current;
		if (video.paused) {
			return;
		}

		video.pause();
		toast("房主暂停了视频");
	};

	const beSeeked = (time: number) => {
		const video = videoRef.current;
		video.currentTime = time;
		toast(
			`房主将视频进度跳转到了${Math.floor(time / 60)}:${Math.floor(time % 60)
				.toString()
				.padStart(2, "0")}`,
		);
	};

	const beRateChanged = (rate: number) => {
		const video = videoRef.current;
		video.playbackRate = rate;
		toast(`房主将播放速度调到了${rate}`);
	};

	const beEpChanged = (ep: number) => {
		setSearchParams(
			(prev) => {
				prev.set("ep", ep.toString());
				return prev;
			},
			{ replace: true },
		);
		toast(`房主切换到了第${ep}话`);
	};

	const beVideoSynced = (payload: unknown) => {
		const { currentTime, playbackRate, paused } = payload as VideoInfo;
		const video = videoRef.current;
		video.currentTime = currentTime;
		video.playbackRate = playbackRate;
		if (paused) {
			bePaused();
		} else {
			bePlayed();
		}
	};

	// 请求同步视频时间、速率等信息
	const syncVideo = () => {
		send("syncVideo");
	};

	useEffect(() => {
		const { current: video } = videoRef;
		if (isHost || !video) {
			return;
		}

		on("played", bePlayed);
		on("paused", bePaused);
		on("seeked", beSeeked);
		on("rateChanged", beRateChanged);
		on("epChanged", beEpChanged);
		on("videoInfo", beVideoSynced);
		syncVideo();

		return () => {
			off("played", bePlayed);
			off("paused", bePaused);
			off("seeked", beSeeked);
			off("rateChanged", beRateChanged);
			off("epChanged", beEpChanged);
			off("videoInfo", beVideoSynced);
		};
	}, [isHost, send, on, off]);

	return (
		<div
			ref={containerRef}
			className="relative aspect-video w-full xl:flex-1 rounded-xl"
		>
			<video
				ref={videoRef}
				src={getAnimeVideoByEp(anime, ep)}
				controls={isHost}
				className="absolute top-0 left-0 size-full"
			/>
			{needInteract && (
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<button
						className="px-8"
						onClick={() => {
							syncVideo();
							setNeedInteract(false);
						}}
					>
						点击播放
					</button>
				</div>
			)}
		</div>
	);
};

export default Video;
