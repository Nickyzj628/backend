import { useSocket } from "@/etc/socket-context";
import { getAnimeVideoByEp, to } from "@/helpers/network";
import { throttle } from "@/helpers/time";
import Danmaku from "danmaku/dist/esm/danmaku.dom.js";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { toast } from "react-hot-toast/headless";
import { useSearchParams } from "wouter-preact";

type Props = {
    anime: Anime;
    isHost?: boolean;
};

const Video = ({
    anime,
    isHost = true,
}: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const ep = Number(searchParams.get("ep")) || 1;

    const socket = useSocket();

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    /**
    * 弹幕发射逻辑
    */

    useEffect(() => {
        const container = containerRef.current;
        if (!socket || !container) {
            return;
        }

        const danmaku = new Danmaku({
            container,
        });
        const onRoomMessage = (message: RoomMessage) => {
            danmaku.emit({
                text: message.text,
                style: {
                    padding: "2px 4px",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                },
            });
        };
        socket.on("roomMessage", onRoomMessage);

        return () => {
            socket.off("roomMessage", onRoomMessage);
        };
    }, [socket]);

    /**
     * 单机视频控制逻辑
     */

    const loadVolume = () => {
        const prevVolume = localStorage.getItem("volume");
        videoRef.current.volume = parseFloat(prevVolume ?? "0.5");
    };

    const saveVolume = () => {
        localStorage.setItem("volume", videoRef.current.volume.toString());
    };

    useEffect(() => {
        const { current: video } = videoRef;
        if (!video) return;

        // 恢复音量大小
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
        socket.emit("play");
    };

    const pauseTogether = () => {
        socket.emit("pause");
    };

    const seekTogether = () => {
        socket.emit("seek", videoRef.current.currentTime);
    };

    const rateChangeTogether = useCallback(throttle(() => {
        socket.emit("rateChange", videoRef.current.playbackRate);
    }), [socket]);

    const videoSyncRequest = (requestorId: string) => {
        const video = videoRef.current;
        socket.emit("videoSyncResponse", requestorId, {
            currentTime: video.currentTime,
            playbackRate: video.playbackRate,
            paused: video.paused,
        });
    };

    useEffect(() => {
        const { current: video } = videoRef;
        if (!isHost || !socket || !video) {
            return;
        }

        video.addEventListener("play", playTogether);
        video.addEventListener("pause", pauseTogether);
        video.addEventListener("seeked", seekTogether);
        video.addEventListener("ratechange", rateChangeTogether);
        socket.on("videoSyncRequest", videoSyncRequest);

        return () => {
            video.removeEventListener("play", playTogether);
            video.removeEventListener("pause", pauseTogether);
            video.removeEventListener("seeked", seekTogether);
            video.removeEventListener("ratechange", rateChangeTogether);
            socket.off("videoSyncRequest", videoSyncRequest);
        };
    }, [isHost, socket]);

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
        toast(`房主将视频进度跳转到了${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}`);
    };

    const beRateChanged = (rate: number) => {
        const video = videoRef.current;
        video.playbackRate = rate;
        toast(`房主将播放速度调到了${rate}`);
    };

    const beEpChanged = (ep: number) => {
        setSearchParams((prev) => {
            prev.set("ep", ep.toString());
            return prev;
        }, { replace: true });
        toast(`房主切换到了第${ep}话`);
    };

    const beVideoSynced = async (info: { currentTime: number; playbackRate: number; paused: boolean }) => {
        const { currentTime, playbackRate, paused } = info;
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
        socket.emit("syncVideo");
    };

    useEffect(() => {
        const { current: video } = videoRef;
        if (isHost || !socket || !video) {
            return;
        }

        socket.on("played", bePlayed);
        socket.on("paused", bePaused);
        socket.on("seeked", beSeeked);
        socket.on("rateChanged", beRateChanged);
        socket.on("epChanged", beEpChanged);
        socket.on("videoInfo", beVideoSynced);
        syncVideo();

        return () => {
            socket.off("played", bePlayed);
            socket.off("paused", bePaused);
            socket.off("seeked", beSeeked);
            socket.off("rateChanged", beRateChanged);
            socket.off("epChanged", beEpChanged);
            socket.off("videoInfo", beVideoSynced);
        };
    }, [isHost, socket]);

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
