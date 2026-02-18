import { BASE_URL } from "@/etc/constants";
import { Figcaption, Figure } from "../../components/figure";
import Timeline from "../../components/timeline";

const Works = () => {
    const groupedWorks = Object.entries(
        Object.groupBy(
            [
                {
                    time: "2023年",
                    title: "毕业设计",
                    description: "React + TDesign + Websocket + SQLite",
                    image: "/About/Works/mentalcomm.webp",
                    href: "https://www.bilibili.com/video/BV1p94y1H7un",
                },
                {
                    time: "2022年",
                    title: "动画放映室",
                    description: "Vue2 + Vuesax + Socket.IO + MySQL",
                    image: "/About/Works/teamdouga.webp",
                    href: "https://www.bilibili.com/video/BV1kZ4y1a7AF",
                },
                {
                    time: "2022年",
                    title: "信息聚合App",
                    description: "Expo + React Native + styled-components + Recoil + SQLite",
                    image: "/About/Works/peek.webp",
                    href: "https://www.bilibili.com/video/BV1rg411i7i2",
                },
                {
                    time: "2019年",
                    title: "暑假实习",
                    description: "Photoshop + ThinkPHP",
                    image: "/About/Works/ygd.webp",
                    href: `${BASE_URL}:2020/Nickyzj/Photos/About/Works/ygd_raw.webp`,
                },
                {
                    time: "2019年",
                    title: "星光计划",
                    description: "Photoshop + Wordpress + MySQL",
                    image: "/About/Works/xgjh.webp",
                    href: `${BASE_URL}:2020/Nickyzj/Photos/About/Works/xgjh_raw.webp`,
                },
                {
                    time: "2018年",
                    title: "世界技能大赛",
                    description: "Photoshop + Wordpress + MySQL",
                    image: "/About/Works/sjjnds.webp",
                    href: `${BASE_URL}:2020/Nickyzj/Photos/About/Works/sjjnds_raw.webp`,
                }
            ],
            (work) => work.time
        )
    );

    return <>
        {groupedWorks.map(([year, works]) => (
            <Timeline key={year} time={year}>
                {works.map((work, i) => (
                    <a key={i} href={work.href} target="_blank">
                        <Figure className="aspect-[3/2] w-64">
                            <Figure.Image
                                src={work.image}
                                alt={work.title}
                                className="no-zoom"
                            />
                            <Figcaption>
                                <Figcaption.Title>
                                    {work.title}
                                </Figcaption.Title>
                                <Figcaption.Description>
                                    {work.description}
                                </Figcaption.Description>
                            </Figcaption>
                        </Figure>
                    </a>
                ))}
            </Timeline>
        ))}
    </>;
};

export default Works;
