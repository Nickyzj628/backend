import { fetcher, timeLog, to } from "@nickyzj2023/utils";
import { safeParse } from "valibot";
import {
	type BrecWebhook,
	GetRoomInfoSchema,
	type RoomInfo,
} from "@/types/brec";

const BREC_WEBHOOK_URL = Bun.env.BREC_WEBHOOK_URL ?? "";
const BREC_ROOM_IDS = Bun.env.BREC_ROOM_IDS?.split(",") ?? [];
const BREC_INTERVAL_MS = 60_000;

const log = (...args: any[]) => timeLog("[brec]", ...args);

const roomIdInfoMap = new Map<string, RoomInfo>();

const liveApi = fetcher("https://api.live.bilibili.com/xlive/web-room/v1", {
	params: {
		req_biz: "web_room_componet",
	},
});

const webhookApi = fetcher(BREC_WEBHOOK_URL);

const runOnce = async () => {
	if (!BREC_WEBHOOK_URL || !BREC_ROOM_IDS.length) {
		log("未配置 BREC_WEBHOOK_URL / BREC_GROUP_IDS / BREC_ROOM_IDS");
		return;
	}

	// 批量获取直播间信息
	// @see https://sessionhu.github.io/bilibili-API-collect/docs/live/info.html#%E8%8E%B7%E5%8F%96%E7%9B%B4%E6%92%AD%E9%97%B4%E5%9F%BA%E6%9C%AC%E4%BF%A1%E6%81%AF
	const queryString = BREC_ROOM_IDS.map((id) => `room_ids=${id}`).join("&");
	const [error, response] = await to(
		liveApi.get(`/index/getRoomBaseInfo?${queryString}`),
	);
	if (error) {
		log(`查询直播间信息失败：${error.message}`);
		return;
	}

	// 校验数据结构
	const validation = safeParse(GetRoomInfoSchema, response);
	if (!validation.success) {
		log(`查询直播间信息失败：${validation.issues[0].message}`);
		return;
	}

	// 收集直播状态有变化的直播间
	const { output } = validation;
	const result: BrecWebhook = [];
	for (const [roomId, roomInfo] of Object.entries(output.data.by_room_ids)) {
		const prevRoomInfo = roomIdInfoMap.get(roomId);
		roomIdInfoMap.set(roomId, roomInfo);

		// 初始化时不推送
		if (!prevRoomInfo) {
			log(`初始化直播间：${roomId}（${roomInfo.uname}）`);
			continue;
		}

		// 直播状态无变化时不推送
		let changedField = "";
		if (prevRoomInfo.live_status !== roomInfo.live_status) {
			changedField = "live_status";
		}
		if (prevRoomInfo.title !== roomInfo.title) {
			changedField = "title";
		}
		if (!changedField) {
			continue;
		}

		result.push({ ...roomInfo, changedField });
	}

	if (!result.length) {
		return;
	}

	// 推送到 webhook 接口
	const [error2] = await to(webhookApi.post("", result));
	if (error2) {
		log(`推送失败：${error2.message}`);
		return;
	}

	const submittedRoomIds = result.map((roomInfo) => roomInfo.room_id);
	log(`推送了直播间开播状态：${submittedRoomIds.join("、")}`);
};

export const startBrecTimer = () => {
	const timer = setInterval(() => {
		void runOnce();
	}, BREC_INTERVAL_MS);

	return () => {
		clearInterval(timer);
	};
};
