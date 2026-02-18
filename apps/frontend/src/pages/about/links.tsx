import { useMemo } from "preact/hooks";
import { Figcaption, Figure } from "../../components/figure";
import Section from "../../components/section";

const Links = () => {
    const links = [
        {
            title: "哔哩哔哩",
            description: "大概每年发一到两部视频的样子",
            image: "/About/Links/bilibili.webp",
            href: "https://space.bilibili.com/1286127",
        },
        {
            title: "优酷",
            description: "本人早期驯服剪辑软件的珍贵影像",
            image: "/About/Links/youku.webp",
            href: "https://www.youku.com/profile/index/?spm=a2hbt.13141534.1_1.d_account&uid=UMTQxMjkwNDc5Ng==",
        },
        {
            title: "osu!",
            description: "只有超越极限，才能攀至顶峰！",
            image: "/About/Links/osu.webp",
            href: "https://osu.ppy.sh/users/4735740",
        },
        {
            title: "Apex",
            description: "17赛季大师举起双手🙋‍",
            image: "/About/Links/apex.webp",
            href: "https://apex.tracker.gg/apex/profile/origin/Nickyzj2021/overview",
        },
        {
            title: "CS:GO",
            description: "都开了是吧？那我也不演了！",
            image: "/About/Links/csgo.webp",
            href: "https://arena.5eplay.com/data/player/tntt/s1/2021/1",
        },
        {
            title: "力扣",
            description: "我们所经历的每个平凡的日常，也许就是……",
            extra: "连续发生的奇迹",
            image: "/About/Links/leetcode.webp",
            href: "https://leetcode.cn/u/nickyzj/",
        },
        {
            title: "GitHub",
            description: "努力、未来、A Beautiful Star",
            image: "/About/Links/github.webp",
            href: "https://github.com/Nickyzj628",
        }
    ];

    const friends = [
        {
            title: "铅笔",
            description: "这是一个圆披萨，简称……",
            extra: "OP！",
            image: "/About/Links/wht.webp",
            href: "https://wpencil.top",
        },
        {
            title: "飞翔",
            description: "奥比岛15年荣誉岛民",
            image: "/About/Links/wjb.webp",
            href: "http://kyzr2000.gitee.io/myblog",
        },
        {
            title: "抹杀",
            description: "居然还在大师",
            image: "/About/Links/fjm.webp",
            href: "https://space.bilibili.com/8268662",
        },
        {
            title: "胖次",
            description: "健身与南桐爱好者",
            image: "/About/Links/yzc.webp",
            href: "https://300report.jumpw.com/#/MyScore?r=537564775&m=0",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <Section>
                <Section.Title className="text-blue-300">我的战绩</Section.Title>
                <div className="mt-1.5 flex flex-wrap gap-3">
                    {links.map((link, i) => (
                        <a key={i} href={link.href} target="_blank">
                            <Figure className="aspect-square w-32 sm:w-36">
                                <Figure.Image
                                    src={link.image}
                                    alt={link.title}
                                    className="no-zoom"
                                />
                                <Figcaption>
                                    <Figcaption.Title>
                                        {link.title}
                                    </Figcaption.Title>
                                    <Figcaption.Description className="max-h-32 text-pretty">
                                        {link.description}
                                    </Figcaption.Description>
                                    {link.extra && (
                                        <Figcaption.Extra>
                                            {link.extra}
                                        </Figcaption.Extra>
                                    )}
                                </Figcaption>
                            </Figure>
                        </a>
                    ))}
                </div>
            </Section>
            <Section>
                <Section.Title className="text-red-300">热血战友</Section.Title>
                <div className="mt-1.5 flex flex-wrap gap-3">
                    {friends.map((friend, i) => (
                        <a key={i} href={friend.href} target="_blank">
                            <Figure className="aspect-square w-32 sm:w-36">
                                <Figure.Image
                                    src={friend.image}
                                    alt={friend.title}
                                    className="no-zoom"
                                />
                                <Figcaption>
                                    <Figcaption.Title>
                                        {friend.title}
                                    </Figcaption.Title>
                                    <Figcaption.Description className="max-h-32 text-pretty">
                                        {friend.description}
                                    </Figcaption.Description>
                                    {friend.extra && (
                                        <Figcaption.Extra>
                                            {friend.extra}
                                        </Figcaption.Extra>
                                    )}
                                </Figcaption>
                            </Figure>
                        </a>
                    ))}
                </div>
            </Section>
        </div>
    );
};

export default Links;
