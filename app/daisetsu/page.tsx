"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Daisetsu() {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* メインビジュアル */}
      <div className="flex flex-col">
        {/* 最初のセクション - メイン写真と紹介 */}
        <div className="flex flex-col md:flex-row items-center min-h-screen relative">
          {/* 左側：画像セクション */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="w-full md:w-1/2 h-screen md:h-screen relative"
          >
            <Image
              src="/daisetsu/Daisetsu.jpg"
              alt="鈴木大拙"
              fill
              className="object-cover brightness-75"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-transparent to-black"></div>
            <div
              className="hidden md:block absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, transparent 75%, rgba(0,0,0,0.8) 90%, rgb(0,0,0) 100%)",
              }}
            ></div>
          </motion.div>

          {/* 右側：テキストセクション */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeOut" }}
            className="w-full md:w-1/2 px-6 md:px-16 pt-8 md:pt-0"
          >
            <div className="max-w-2xl mx-auto md:mx-0">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, delay: 3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              >
                鈴木 大拙
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, delay: 3.5 }}
                className="text-lg md:text-xl text-gray-300 mb-8"
              >
                1870-1966
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, delay: 4 }}
                className="text-base md:text-lg text-gray-400 leading-relaxed"
              >
                20世紀を代表する思想家であり、
                禅仏教の思想を世界に広めた仏教学者。 本名は貞太郎で、
                禅の師である釈宗演から授かった居士号「大拙」を用いて活動した。
                22歳で上京後、 鎌倉円覚寺に参禅し、 今北洪川と釈宗演に師事。
                27歳でアメリカに渡り、
                イリノイ州の出版社で東洋学関係の出版に携わった。 この経験が、
                西洋思想への理解を深め、
                仏教の概念を西洋の読者にわかりやすく翻訳する能力を養う基礎となった。
              </motion.p>

              {/* 特別な名言表示 */}
              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 3, delay: 5, ease: "easeOut" }}
                className="mt-12 md:mt-24 relative w-full overflow-hidden"
              >
                <motion.p
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/90 whitespace-nowrap"
                  initial={{ letterSpacing: "0.1em", opacity: 0 }}
                  animate={{ letterSpacing: "0.15em", opacity: 1 }}
                  transition={{ duration: 3, delay: 6 }}
                >
                  『わしにはわからん』
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* スクロールセクション */}
        <div className="bg-gradient-to-b from-black to-gray-900">
          {/* 思想と哲学 */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="py-12 md:py-24 px-6 md:px-16"
          >
            <div className="max-w-[1920px] mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 mb-16 md:mb-32">
                <div className="w-full md:w-2/3 md:pr-16">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-white/90">
                    思想と哲学
                  </h2>
                  <div className="space-y-8 md:space-y-12">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white/80">
                        禅の本質
                      </h3>
                      <p className="text-sm md:text-base lg:text-lg text-gray-400 leading-relaxed mb-4 md:mb-8">
                        禅の思想を基盤とし、 西洋哲学に通暁しながら、 東洋、
                        特に日本の思想・文化には西洋に伝えるべき独自の価値があることを確信していた。
                        実体験に基づいた思想を展開し、
                        禅を単なる宗教や哲学としてではなく、 「Living by
                        Zen」として捉えた。
                      </p>
                      <p className="text-gray-400 leading-relaxed">
                        言葉や文字に頼らない禅の教えを、
                        どのように言葉で表現するかが、
                        彼の生涯における課題であった。
                        禅の本質を英語で説明することに成功した最初の日本人学者として、
                        その功績は特筆すべきものである。
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white/80">
                        即非の論理
                      </h3>
                      <p className="text-sm md:text-base lg:text-lg text-gray-400 leading-relaxed mb-4 md:mb-8">
                        東洋と西洋の二項対立を超えた「一つの世界」の構築を目指し、
                        「即非の論理」を体系化した。 これは、
                        一見矛盾する二つのものが、
                        実は一体であるという禅の考え方を理論化したものである。
                      </p>
                      <p className="text-gray-400 leading-relaxed">
                        心と体、 主観と客観、 生と死など、 一見対立する概念も、
                        根源においては一つであるという考え方を示した。 例えば、
                        光と影は一見対立するようでも、
                        光がなければ影は存在しない。 このように、
                        相反するものは互いに依存し合い、
                        一体をなしているのである。
                      </p>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="w-1/3 relative h-[600px]"
                >
                  <Image
                    src="/daisetsu/Daisetsu2.jpg"
                    alt="鈴木大拙 瞑想"
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 影響と遺産 */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="py-24 px-16 bg-black/30"
          >
            <div className="max-w-[1920px] mx-auto">
              <div className="flex items-center mb-32">
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="w-1/3 relative h-[600px]"
                >
                  <Image
                    src="/daisetsu/Daisetsu3.jpg"
                    alt="鈴木大拙 講演"
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.div>
                <div className="w-2/3 pl-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white/90">
                    影響と遺産
                  </h2>
                  <div className="grid grid-cols-1 gap-12">
                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-white/80">
                        世界的影響
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        その影響力は世界中に及び、
                        精神分析学者のカール・グスタフ・ユング、
                        ビート・ジェネレーションの作家たち、
                        そしてAppleのスティーブ・ジョブズにまで影響を与えた。
                        1960年代には禅ブームを巻き起こし、
                        西洋における東洋思想の理解を大きく前進させた。
                      </p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-white/80">
                        日本文化への貢献
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        禅の思想は、 茶道、 華道、 書道、
                        剣道といった日本の伝統芸能の精神性や美意識の根底に流れており、
                        これらを通じて日本文化の精髄を世界に伝えた。
                        「日本的霊性」という概念を提示し、
                        日本文化における独自の霊性観を体系化した。
                      </p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-white/80">
                        学術的功績
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        90代に入っても精力的に研究活動を続け、1963年にはノーベル平和賞の候補にも挙がった。大谷大学で英文誌『イースタン・ブディスト』を創刊し、仏教思想の世界的な研究と普及に貢献した。妻のベアトリス・レインとともに、東洋と西洋の架け橋となることを目指した。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 主要著作と名言 */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="py-24 px-16"
          >
            <div className="max-w-[1920px] mx-auto">
              <div className="flex items-center mb-32">
                <div className="w-2/3 pr-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white/90">
                    主要著作と名言
                  </h2>
                  <div className="space-y-16">
                    <div>
                      <h3 className="text-2xl font-bold mb-8 text-white/80">
                        代表的著作
                      </h3>
                      <ul className="space-y-8 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-white/60 mr-4">▹</span>
                          <div>
                            <span className="font-bold text-xl">
                              『禅と日本文化』
                            </span>
                            <p className="mt-4 leading-relaxed">
                              禅が日本文化に与えた影響を分析した代表作。書道、茶道、剣道など、日本の伝統芸能における禅の影響を詳細に解説。日本文化の精神性を世界に向けて体系的に説明した画期的な著作として高く評価されている。
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="text-white/60 mr-4">▹</span>
                          <div>
                            <span className="font-bold text-xl">
                              『大乗仏教概論』
                            </span>
                            <p className="mt-4 leading-relaxed">
                              1907年に出版された大乗仏教の本質を解説した重要著作。西洋読者向けに仏教思想を体系的に説明。当時としては画期的な試みであり、東洋思想の西洋への架け橋となった記念碑的著作。
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="text-white/60 mr-4">▹</span>
                          <div>
                            <span className="font-bold text-xl">
                              『日本的霊性』
                            </span>
                            <p className="mt-4 leading-relaxed">
                              日本人の宗教観や霊性観を、歴史や文化を踏まえて解説した著作。日本文化の深層を理解する上で重要な指針を提供。日本人の精神性の特質を鋭く分析し、その独自性を明らかにした。
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="w-1/3 relative h-[600px]"
                >
                  <Image
                    src="/daisetsu/Daisetsu4.jpg"
                    alt="鈴木大拙 肖像"
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 心に響く名言 - 中央配置のセクション */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="py-24 px-16 bg-black/30"
          >
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-white/90 text-center">
                心に響く名言
              </h2>
              <div className="grid gap-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-12 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-3xl md:text-4xl text-white/90 italic text-center mb-8">
                    「わしにはわからん」
                  </p>
                  <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
                    禅の真髄を表現した言葉。知的理解を超えた境地、「無知の知」を体現している。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-12 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-3xl md:text-4xl text-white/90 italic text-center mb-8">
                    「禅とは何か。坐禅することである」
                  </p>
                  <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
                    禅の本質を端的に表現した言葉。理論や解釈ではなく、実践の重要性を説いている。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-12 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-3xl md:text-4xl text-white/90 italic text-center mb-8">
                    「我々は知性に生きるのではなく、意志に生きるのだ」
                  </p>
                  <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
                    知的理解を超えた、実践的な生き方の重要性を説いた言葉。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-12 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-3xl md:text-4xl text-white/90 italic text-center mb-8">
                    「東洋の心は無心になる事。どこまでいっても無限で天地の分かれがない。」
                  </p>
                  <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
                    東洋思想の本質を表現した言葉。二元論を超えた世界観を示している。
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 鈴木大拙館 */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="py-24 px-16 bg-black/30"
          >
            <div className="max-w-[1920px] mx-auto">
              <div className="flex items-center mb-32">
                <div className="w-2/3 pr-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white/90">
                    鈴木大拙館
                  </h2>
                  <div className="space-y-8">
                    <p className="text-gray-400 leading-relaxed">
                      2011年に金沢市に開館した鈴木大拙館は、
                      建築家・谷口吉生の設計による現代建築の傑作です。
                      大拙の思想と禅の世界観を建築空間として表現し、
                      瞑想空間や水鏡の庭など、 独創的な空間構成が特徴です。
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      館内には大拙の著作や遺品、 写真などの資料が展示され、
                      その生涯と思想を学ぶことができます。
                      特に「思索空間」と呼ばれる円形の瞑想室は、
                      大拙の説いた「禅的な心のあり方」を体験できる空間として設計されています。
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      また、 「水鏡の庭」は、 禅の思想を現代的に解釈した空間で、
                      水面に映る景色の変化を通じて、
                      「空」や「無」の概念を体感することができます。
                      建築そのものが大拙の思想を体現する「体験型ミュージアム」となっています。
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="w-1/3 relative h-[800px]"
                >
                  <Image
                    src="/daisetsu/Daisetsu-kan.jpg"
                    alt="鈴木大拙館"
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
