import "@/assets/uno.css";
import "@unocss/reset/tailwind-v4.css";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import { render } from "preact";
import "virtual:uno.css";
import DefaultLayout from "./layouts/default";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

render(<DefaultLayout />, document.body);
