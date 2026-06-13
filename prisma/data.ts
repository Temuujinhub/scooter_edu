// ScooterEdu MN — Сургалтын контент ба асуултын сан (seed өгөгдөл)
// Судалгааны баримтын 7, 8-р хэсэгт үндэслэв.

export interface SeedOption {
  key: string;
  text: string;
  isCorrect: boolean;
}
export interface SeedQuestion {
  moduleCode: 'M1' | 'M2' | 'M3' | 'M4';
  questionMn: string;
  options: SeedOption[];
  explanationMn: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}
export interface SeedModule {
  moduleNumber: number;
  moduleCode: 'M1' | 'M2' | 'M3' | 'M4';
  titleMn: string;
  summaryMn: string;
  durationMin: number;
  keyPoints: string[];
  contentHtml: string;
}

// ── 4 МОДУЛИЙН АГУУЛГА ───────────────────────────────────────────
export const modules: SeedModule[] = [
  {
    moduleNumber: 1,
    moduleCode: 'M1',
    titleMn: 'Монголын Хуулийн Орчин',
    summaryMn:
      'E-scooter-тэй холбоотой Монгол Улсын хууль, дүрэм, торгуулийн талаар бүрэн мэдлэг.',
    durationMin: 20,
    keyPoints: [
      '2026.06.30-наас скүүтэр явган хүний замаар явахыг хатуу хориглосон',
      'Хотын нийтийн замаар дээд хурд 25 км/цаг',
      'Дуулга өмсөх нь хуулийн шаардлага',
      '18-аас доош насны хүүхэд жолоодвол эцэг эхийг 400,000₮ торгоно',
      'Согтуурал 0.2 промиль — хатуу хориотой',
    ],
    contentHtml: `
<h3>1.1 Хуулийн тойм</h3>
<p>Монгол Улсад цахилгаан скүүтэр (e-scooter) хэрэглэх нь "Замын хөдөлгөөний аюулгүй байдлын тухай хууль" болон Нийслэлийн Засаг даргын захирамжуудаар (А/387, А/552, А/820) зохицуулагдана.</p>
<ul>
  <li><strong>"А" ангиллын үнэмлэх</strong> — цахилгаан дугуй (Surron), мотоцикл жолоодоход заавал шаардлагатай.</li>
  <li>Жирийн түрээсийн скүүтэрт одоогоор тусгай зохицуулалт хэрэгжих шатандаа байна.</li>
</ul>

<h3>1.2 Хоригтой зам ба бүс</h3>
<p><strong>2026 оны 6-р сарын 30-наас эхлэн</strong> скүүтэр, мопедыг явган хүний замаар явахыг хатуу хориглосон. Зөвхөн хөтөлж гарна.</p>
<ul>
  <li>Дугуйн зам байвал — дугуйн замаар явна.</li>
  <li>Дугуйн зам байхгүй бол — авто замын баруун талаас 1 метрийн дотор явна.</li>
  <li>Их хурдны зам, хотын хязгаарлагдмал бүсэд явахыг хориглоно.</li>
</ul>

<h3>1.3 Жолоодлогын шаардлага</h3>
<ul>
  <li><strong>Дуулга</strong> — заавал өмсөнө (хуулийн шаардлага).</li>
  <li><strong>Гар утас</strong> — жолоодож яваандаа ашиглахыг хориглоно.</li>
  <li><strong>Согтуурал</strong> — 0.2 промиль хэтрэхийг хатуу хориглоно.</li>
  <li><strong>Хурд</strong> — хотын нийтийн замаар 25 км/цаг хэтрүүлэхгүй.</li>
  <li><strong>Хоёр хүн</strong> унахыг хориглоно.</li>
</ul>

<h3>1.4 Торгуулийн хүснэгт</h3>
<table>
  <tr><th>Зөрчил</th><th>Торгууль</th></tr>
  <tr><td>Явган хүний замаар явах</td><td>50,000–150,000₮</td></tr>
  <tr><td>18-аас доош насны жолоодогч</td><td>400,000₮ (эцэг эхэд)</td></tr>
  <tr><td>Дуулгагүй жолоодох</td><td>20,000–50,000₮</td></tr>
  <tr><td>Гар утас ашиглах</td><td>50,000₮</td></tr>
  <tr><td>Согтуугаар жолоодох</td><td>150,000–500,000₮ + эрх хасах</td></tr>
  <tr><td>Хурд хэтрүүлэх</td><td>30,000–100,000₮</td></tr>
</table>

<h3>1.5 УБ хотын онцлог</h3>
<p>2026 оны шинэ захирамжаар хотын төв бүс, явган хүний бүсэд скүүтэр явахыг хязгаарласан. Хэрэглэгч өөрийн маршрутаа урьдчилан төлөвлөж, зөвшөөрөгдсөн замаар явах ёстой.</p>
`,
  },
  {
    moduleNumber: 2,
    moduleCode: 'M2',
    titleMn: 'E-Scooter Техник ба Аюулгүй Байдал',
    summaryMn:
      'Скүүтэр унахын өмнөх STOP шалгалт, тоног төхөөрөмж, аюулгүй байдлын дадал.',
    durationMin: 20,
    keyPoints: [
      'Унахын өмнө STOP шалгалт хийнэ',
      'Батерей 20%-аас дээш байх ёстой',
      'Дуулгыг 2 хуруу орох зайтай бэхэлнэ',
      'Гэмтэлтэй батерей галын аюултай — хэрэглэхгүй',
      'Тормос, хүрдийг хөдлөхөөс өмнө шалгана',
    ],
    contentHtml: `
<h3>2.1 STOP Шалгалтын Дадал</h3>
<p>Скүүтэр унах болгондоо <strong>STOP</strong> шалгалтыг хийснээр ослоос сэргийлнэ:</p>
<table>
  <tr><th>Үсэг</th><th>Утга</th><th>Шалгах зүйл</th></tr>
  <tr><td><strong>S</strong></td><td>Safety gear</td><td>Дуулга өмссөн үү? Гутал тохиромжтой юу?</td></tr>
  <tr><td><strong>T</strong></td><td>Tire &amp; Brake</td><td>Хүрдний даралт, тормос ажиллаж байна уу?</td></tr>
  <tr><td><strong>O</strong></td><td>On (Power)</td><td>Батерей 20%-аас дээш байна уу?</td></tr>
  <tr><td><strong>P</strong></td><td>Platform check</td><td>Апп дотор бүртгэгдсэн, скүүтэр зөв ажиллаж байна уу?</td></tr>
</table>

<h3>2.2 Хамгаалалтын хэрэгсэл</h3>
<ul>
  <li><strong>Дуулга</strong> — толгойн хэмжээнд тааруулж, эрүүний боолтыг 2 хуруу орох зайтай бэхэлнэ.</li>
  <li><strong>Гутал</strong> — хальтиргаагүй, хаалттай гутал өмсөнө. Шаахай хориотой.</li>
  <li>Шөнө явахдаа гэрэл ойлгогч (reflector) хувцас өмсвөл аюулгүй.</li>
</ul>

<h3>2.3 Батерей ба цахилгаан аюулгүй байдал</h3>
<ul>
  <li>Батерей <strong>20%-аас дээш</strong> байж байж унана. Дунд замд унтрах эрсдэлтэй.</li>
  <li>Хөөсөн, гэмтсэн, хэв гажсан батерейтай скүүтэр <strong>галын аюултай</strong> — хэрэглэхийг хориглоно.</li>
  <li>Бороонд норсон скүүтэрийг шалгаж байж унана.</li>
</ul>

<h3>2.4 Тормос ба хяналт</h3>
<p>Хөдлөхөөс өмнө урд, хойд тормосыг тус тусад нь шалгана. Тормос сул, гацсан тохиолдолд скүүтэрийг ашиглахгүй, аппаар мэдэгдэнэ.</p>
`,
  },
  {
    moduleNumber: 3,
    moduleCode: 'M3',
    titleMn: 'Хотын Нөхцөл дэх Жолоодлого',
    summaryMn:
      'Улаанбаатар хотын замын онцлог аюулууд, тэдгээрээс сэргийлэх практик арга.',
    durationMin: 25,
    keyPoints: [
      'Замын нүхийг хурд бууруулж тойрно',
      'Зогссон машины хаалганаас 1 метр зайтай явна',
      'Гудамжны нохойноос чиглэлээ алдалгүй зайлсхийнэ',
      'Оройн цагт скүүтэрийн гэрлийг асаана',
      'Өвлийн мөсөн дээр тормосоо аажмаар хэрэглэнэ',
    ],
    contentHtml: `
<h3>3.1 Хотын замын онцлог аюулууд</h3>
<table>
  <tr><th>Аюул</th><th>Тайлбар</th><th>Шийдэл</th></tr>
  <tr><td>Замын нүх</td><td>УБ хотын замд нэлээд их</td><td>Хурдаа бууруулж тойрох</td></tr>
  <tr><td>Гудамжны нохой</td><td>Хойноос хөөж болзошгүй</td><td>Чиглэлээ тогтвортой хадгалах</td></tr>
  <tr><td>Зогссон машины хаалга</td><td>Гэнэт нээгдэж болно</td><td>1 метрийн зайтай явах</td></tr>
  <tr><td>Муу гэрэлтүүлэг</td><td>Оройн гудамжид харалт бага</td><td>Скүүтэрийн гэрлийг асаах</td></tr>
  <tr><td>Мөс, цас</td><td>Өвлийн улиралд гулгана</td><td>Хурд бууруулж, тормосоо аажмаар хэрэглэх</td></tr>
</table>

<h3>3.2 Хөдөлгөөнд оролцох</h3>
<ul>
  <li>Эргэлт хийхээс өмнө хойшоо ажиглаж, гараараа дохио өгнө.</li>
  <li>Уулзвар дээр хурдаа бууруулж, бүх талаа харна.</li>
  <li>Бусад тээврийн хэрэгсэлтэй зэрэгцэн явахдаа тогтвортой зайг барина.</li>
</ul>

<h3>3.3 Цаг агаарын нөхцөл</h3>
<ul>
  <li><strong>Бороо</strong> — зам гулгамтгай болж, тормосны зам уртасна. Хурдаа бууруулна.</li>
  <li><strong>Цас, мөс</strong> — өвлийн улиралд аль болох тэгш зам сонгож, гэнэтийн эргэлт хийхгүй.</li>
  <li><strong>Салхи</strong> — хүчтэй салхинд тэнцвэр алдагдаж болзошгүй тул хоёр гараараа бариулыг бариулна.</li>
</ul>
`,
  },
  {
    moduleNumber: 4,
    moduleCode: 'M4',
    titleMn: 'Эрсдэл ба Ослоос Сэргийлэх',
    summaryMn:
      'Ослын гол шалтгаанууд ба SIPDE хамгаалалтын жолоодлогын загвар.',
    durationMin: 25,
    keyPoints: [
      'Ослын 35% нь хурд хэтрүүлснээс болдог',
      'Ослын 28% нь дуулгагүй явсантай холбоотой',
      'SIPDE: Scan-Identify-Predict-Decide-Execute',
      'Гар утсыг зөвхөн зогсоод ашиглана',
      'Согтуу үед огт жолоодохгүй',
    ],
    contentHtml: `
<h3>4.1 Ослын шалтгааны статистик</h3>
<table>
  <tr><th>Шалтгаан</th><th>Давтамж</th><th>Сэргийлэх арга</th></tr>
  <tr><td>Хурд хэтрүүлэх</td><td>35%</td><td>25 км/ц-аас хэтрүүлэхгүй</td></tr>
  <tr><td>Дуулгагүй явах</td><td>28%</td><td>Заавал дуулга өмсөх</td></tr>
  <tr><td>Замын нүхэнд унах</td><td>20%</td><td>Хурд бууруулж, замаа шалгах</td></tr>
  <tr><td>Гар утас ашиглах</td><td>10%</td><td>Зогсоод л ашиглах</td></tr>
  <tr><td>Согтуу жолоодлого</td><td>7%</td><td>Огт явахгүй байх</td></tr>
</table>

<h3>4.2 SIPDE — Хамгаалалтын Жолоодлогын Загвар</h3>
<p>Туршлагатай жолоодогчид дараах 5 алхмыг автоматаар хэрэгжүүлдэг:</p>
<table>
  <tr><th>Үсэг</th><th>Утга</th><th>Тайлбар</th></tr>
  <tr><td><strong>S</strong></td><td>Scan</td><td>Замын байдлыг урьдчилан харах</td></tr>
  <tr><td><strong>I</strong></td><td>Identify</td><td>Аюулыг тодорхойлох</td></tr>
  <tr><td><strong>P</strong></td><td>Predict</td><td>Нөхцөл байдлыг таамаглах</td></tr>
  <tr><td><strong>D</strong></td><td>Decide</td><td>Шийдвэр гаргах</td></tr>
  <tr><td><strong>E</strong></td><td>Execute</td><td>Шийдвэрийг гүйцэтгэх</td></tr>
</table>

<h3>4.3 Осолд орвол яах вэ?</h3>
<ul>
  <li>Эхлээд өөрийн аюулгүй байдлыг хангана (замаас гарах).</li>
  <li>Шаардлагатай бол 103 (түргэн тусламж), 102 (цагдаа) дугаарт залгана.</li>
  <li>Осол гарсан газар, цагийг апп дотор тэмдэглэж, гэрэл зураг авна.</li>
</ul>
`,
  },
];

// ── АСУУЛТЫН САН ─────────────────────────────────────────────────
export const questions: SeedQuestion[] = [
  // ── Модуль 1: Хуулийн орчин ──
  {
    moduleCode: 'M1',
    questionMn: 'Монгол Улсад e-scooter-ийг явган хүний замаар явахыг яадаг вэ?',
    options: [
      { key: 'A', text: 'Зөвшөөрдөг', isCorrect: false },
      { key: 'B', text: 'Хориглодог', isCorrect: true },
      { key: 'C', text: 'Зөвхөн оройн цагт зөвшөөрдөг', isCorrect: false },
      { key: 'D', text: 'Хязгаарлалтгүй', isCorrect: false },
    ],
    explanationMn: '2026.06.30-наас явган хүний замаар явахыг хатуу хориглосон.',
    difficulty: 'easy',
    tags: ['law', 'traffic'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Хотын нийтийн замаар явах дээд хурд хэд вэ?',
    options: [
      { key: 'A', text: '15 км/цаг', isCorrect: false },
      { key: 'B', text: '20 км/цаг', isCorrect: false },
      { key: 'C', text: '25 км/цаг', isCorrect: true },
      { key: 'D', text: '40 км/цаг', isCorrect: false },
    ],
    explanationMn: 'Хотын нийтийн замаар дээд хурд 25 км/цаг.',
    difficulty: 'easy',
    tags: ['law', 'speed'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Жолоодож яваандаа гар утас ашиглавал ямар торгуультай вэ?',
    options: [
      { key: 'A', text: '20,000₮', isCorrect: false },
      { key: 'B', text: '50,000₮', isCorrect: true },
      { key: 'C', text: '100,000₮', isCorrect: false },
      { key: 'D', text: 'Торгуульгүй', isCorrect: false },
    ],
    explanationMn: 'Гар утас ашиглавал 50,000₮ торгууль ногдоно.',
    difficulty: 'medium',
    tags: ['law', 'fine'],
  },
  {
    moduleCode: 'M1',
    questionMn: '18-аас доош насны хүүхэд скүүтэр жолоодвол хэнийг торгох вэ?',
    options: [
      { key: 'A', text: 'Хүүхдийг 100,000₮', isCorrect: false },
      { key: 'B', text: 'Эцэг эхийг 400,000₮', isCorrect: true },
      { key: 'C', text: 'Хэнийг ч торгохгүй', isCorrect: false },
      { key: 'D', text: 'Сургуулийг', isCorrect: false },
    ],
    explanationMn: 'Насанд хүрээгүй хүүхэд жолоодвол эцэг эхийг 400,000₮-өөр торгоно.',
    difficulty: 'medium',
    tags: ['law', 'age', 'fine'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Дуулга өмсөх нь ямар шаардлага вэ?',
    options: [
      { key: 'A', text: 'Заавал (хуулийн шаардлага)', isCorrect: true },
      { key: 'B', text: 'Сонголтоор', isCorrect: false },
      { key: 'C', text: 'Зөвхөн хурдан явахад', isCorrect: false },
      { key: 'D', text: 'Шаардлагагүй', isCorrect: false },
    ],
    explanationMn: 'Дуулга өмсөх нь хуулийн заавал шаардлага юм.',
    difficulty: 'easy',
    tags: ['law', 'safety'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Согтууруулах ундааны зөвшөөрөгдөх дээд хэмжээ хэд вэ?',
    options: [
      { key: 'A', text: '0.5 промиль', isCorrect: false },
      { key: 'B', text: '0.2 промиль (хатуу хориотой)', isCorrect: true },
      { key: 'C', text: '1.0 промиль', isCorrect: false },
      { key: 'D', text: 'Хязгаар байхгүй', isCorrect: false },
    ],
    explanationMn: '0.2 промилиэс дээш согтуурал хатуу хориотой, хуулийн хариуцлагатай.',
    difficulty: 'medium',
    tags: ['law', 'alcohol'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Дугуйн зам байхгүй бол скүүтэр хаагуур явах ёстой вэ?',
    options: [
      { key: 'A', text: 'Явган хүний замаар', isCorrect: false },
      { key: 'B', text: 'Авто замын баруун талаас 1 метрийн дотор', isCorrect: true },
      { key: 'C', text: 'Замын голоор', isCorrect: false },
      { key: 'D', text: 'Хаана ч болно', isCorrect: false },
    ],
    explanationMn: 'Дугуйн зам байхгүй бол авто замын баруун талаас 1 метрийн дотор явна.',
    difficulty: 'medium',
    tags: ['law', 'traffic'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Согтуугаар жолоодвол ямар хариуцлага хүлээх вэ?',
    options: [
      { key: 'A', text: 'Зөвхөн сануулга', isCorrect: false },
      { key: 'B', text: '150,000–500,000₮ + эрх хасах', isCorrect: true },
      { key: 'C', text: '10,000₮', isCorrect: false },
      { key: 'D', text: 'Хариуцлагагүй', isCorrect: false },
    ],
    explanationMn: 'Согтуугаар жолоодвол 150,000–500,000₮ торгууль ба эрх хасагдана.',
    difficulty: 'hard',
    tags: ['law', 'fine'],
  },
  {
    moduleCode: 'M1',
    questionMn: '2026 оны 6-р сарын 30-наас юуг хатуу хориглосон бэ?',
    options: [
      { key: 'A', text: 'Скүүтэр, мопедыг явган хүний замаар явахыг', isCorrect: true },
      { key: 'B', text: 'Скүүтэр худалдахыг', isCorrect: false },
      { key: 'C', text: 'Түрээслэхийг', isCorrect: false },
      { key: 'D', text: 'Шөнө явахыг', isCorrect: false },
    ],
    explanationMn: '2026.06.30-наас скүүтэр, мопедыг явган хүний замаар явахыг хориглосон.',
    difficulty: 'easy',
    tags: ['law'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Явган хүний замаар явсан тохиолдолд торгуулийн хэмжээ хэд вэ?',
    options: [
      { key: 'A', text: '5,000–10,000₮', isCorrect: false },
      { key: 'B', text: '50,000–150,000₮', isCorrect: true },
      { key: 'C', text: '500,000₮', isCorrect: false },
      { key: 'D', text: 'Торгуульгүй', isCorrect: false },
    ],
    explanationMn: 'Явган хүний замаар явбал 50,000–150,000₮ торгуультай.',
    difficulty: 'medium',
    tags: ['law', 'fine'],
  },
  {
    moduleCode: 'M1',
    questionMn: '"А" ангиллын үнэмлэх ямар тээврийн хэрэгсэлд шаардлагатай вэ?',
    options: [
      { key: 'A', text: 'Жирийн түрээсийн скүүтэр', isCorrect: false },
      { key: 'B', text: 'Цахилгаан дугуй (Surron), мотоцикл', isCorrect: true },
      { key: 'C', text: 'Унадаг дугуй', isCorrect: false },
      { key: 'D', text: 'Бүх төрлийн скүүтэр', isCorrect: false },
    ],
    explanationMn: '"А" ангилал нь цахилгаан дугуй (Surron), мотоцикл жолоодоход шаардлагатай.',
    difficulty: 'hard',
    tags: ['law', 'license'],
  },
  {
    moduleCode: 'M1',
    questionMn: 'Скүүтэр дээр хэдэн хүн унаж болох вэ?',
    options: [
      { key: 'A', text: 'Зөвхөн 1 хүн', isCorrect: true },
      { key: 'B', text: '2 хүн', isCorrect: false },
      { key: 'C', text: 'Хүссэн хэдэн хүн', isCorrect: false },
      { key: 'D', text: '3 хүн хүртэл', isCorrect: false },
    ],
    explanationMn: 'Скүүтэр дээр зөвхөн нэг хүн унах ёстой, хоёр хүн унахыг хориглоно.',
    difficulty: 'easy',
    tags: ['law', 'safety'],
  },

  // ── Модуль 2: Техник ──
  {
    moduleCode: 'M2',
    questionMn: 'Унахын өмнө батерей хэдэн хувиас дээш байх ёстой вэ?',
    options: [
      { key: 'A', text: '5%+', isCorrect: false },
      { key: 'B', text: '10%+', isCorrect: false },
      { key: 'C', text: '20%+', isCorrect: true },
      { key: 'D', text: '50%+', isCorrect: false },
    ],
    explanationMn: 'Дунд замд унтрахаас сэргийлж батерей 20%-аас дээш байх ёстой.',
    difficulty: 'easy',
    tags: ['technique', 'battery'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'STOP шалгалтын T үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Time', isCorrect: false },
      { key: 'B', text: 'Tire & Brake (хүрд ба тормос)', isCorrect: true },
      { key: 'C', text: 'Turn', isCorrect: false },
      { key: 'D', text: 'Traffic', isCorrect: false },
    ],
    explanationMn: 'T = Tire & Brake — хүрдний даралт, тормосыг шалгана.',
    difficulty: 'medium',
    tags: ['technique', 'stop'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'STOP шалгалтын S үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Safety gear (хамгаалалтын хэрэгсэл)', isCorrect: true },
      { key: 'B', text: 'Speed', isCorrect: false },
      { key: 'C', text: 'Start', isCorrect: false },
      { key: 'D', text: 'Stop', isCorrect: false },
    ],
    explanationMn: 'S = Safety gear — дуулга, гутал зэрэг хамгаалалтын хэрэгслийг шалгана.',
    difficulty: 'medium',
    tags: ['technique', 'stop'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'STOP шалгалтын O үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Off', isCorrect: false },
      { key: 'B', text: 'On (Power) — цэнэг, тэжээл', isCorrect: true },
      { key: 'C', text: 'Open', isCorrect: false },
      { key: 'D', text: 'Order', isCorrect: false },
    ],
    explanationMn: 'O = On (Power) — батерейн цэнэг, тэжээлийг шалгана.',
    difficulty: 'medium',
    tags: ['technique', 'stop'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'Дуулгыг зөв бэхэлсний шинж юу вэ?',
    options: [
      { key: 'A', text: 'Эрүүний боолт 2 хуруу орох зайтай', isCorrect: true },
      { key: 'B', text: 'Маш чанга, амьсгал боогдтол', isCorrect: false },
      { key: 'C', text: 'Сул, толгойноос унатлаа', isCorrect: false },
      { key: 'D', text: 'Боолтгүй', isCorrect: false },
    ],
    explanationMn: 'Зөв бэхэлсэн дуулга нь эрүүний доор 2 хуруу орох зайтай байна.',
    difficulty: 'medium',
    tags: ['technique', 'helmet'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'Гэмтэлтэй (хөөсөн) батерейтай скүүтэрийг яах вэ?',
    options: [
      { key: 'A', text: 'Хэвийн ашиглана', isCorrect: false },
      { key: 'B', text: 'Галын аюултай тул хэрэглэхийг хориглоно', isCorrect: true },
      { key: 'C', text: 'Усанд дүрнэ', isCorrect: false },
      { key: 'D', text: 'Бага зэрэг ашиглаж болно', isCorrect: false },
    ],
    explanationMn: 'Гэмтэлтэй батерей галын аюултай тул хэрэглэхийг хатуу хориглоно.',
    difficulty: 'hard',
    tags: ['technique', 'battery', 'safety'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'Тормосыг хэзээ шалгах ёстой вэ?',
    options: [
      { key: 'A', text: 'Хөдлөхөөс өмнө', isCorrect: true },
      { key: 'B', text: 'Унаж дууссаны дараа', isCorrect: false },
      { key: 'C', text: 'Шалгах шаардлагагүй', isCorrect: false },
      { key: 'D', text: 'Долоо хоногт нэг удаа', isCorrect: false },
    ],
    explanationMn: 'Хөдлөхөөс өмнө урд, хойд тормосыг шалгана.',
    difficulty: 'easy',
    tags: ['technique', 'brake'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'STOP шалгалтын P үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Park', isCorrect: false },
      { key: 'B', text: 'Platform check (апп, скүүтэрийн байдал)', isCorrect: true },
      { key: 'C', text: 'Phone', isCorrect: false },
      { key: 'D', text: 'Push', isCorrect: false },
    ],
    explanationMn: 'P = Platform check — апп дотор бүртгэгдсэн, скүүтэр зөв ажиллаж байгааг шалгана.',
    difficulty: 'medium',
    tags: ['technique', 'stop'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'Скүүтэр унахад ямар гутал тохиромжтой вэ?',
    options: [
      { key: 'A', text: 'Шаахай', isCorrect: false },
      { key: 'B', text: 'Хальтиргаагүй, хаалттай гутал', isCorrect: true },
      { key: 'C', text: 'Өндөр өсгийт', isCorrect: false },
      { key: 'D', text: 'Хөл нүцгэн', isCorrect: false },
    ],
    explanationMn: 'Хальтиргаагүй, хаалттай гутал өмсөх нь аюулгүй. Шаахай хориотой.',
    difficulty: 'easy',
    tags: ['technique', 'safety'],
  },
  {
    moduleCode: 'M2',
    questionMn: 'Скүүтэр унахын өмнө хийх үндсэн дадал юу вэ?',
    options: [
      { key: 'A', text: 'STOP шалгалт', isCorrect: true },
      { key: 'B', text: 'Хурдан гарах', isCorrect: false },
      { key: 'C', text: 'Хөгжим сонсох', isCorrect: false },
      { key: 'D', text: 'Юу ч хийхгүй', isCorrect: false },
    ],
    explanationMn: 'Унах болгондоо STOP (Safety-Tire-On-Platform) шалгалтыг хийнэ.',
    difficulty: 'easy',
    tags: ['technique', 'stop'],
  },

  // ── Модуль 3: Хотын жолоодлого ──
  {
    moduleCode: 'M3',
    questionMn: 'Замын нүхтэй тулгарвал яаж жолоодох вэ?',
    options: [
      { key: 'A', text: 'Хурдаа нэмж үсрэх', isCorrect: false },
      { key: 'B', text: 'Хурдаа бууруулж тойрох', isCorrect: true },
      { key: 'C', text: 'Нүд аньж дайрах', isCorrect: false },
      { key: 'D', text: 'Зогсох', isCorrect: false },
    ],
    explanationMn: 'Замын нүхийг хурдаа бууруулж, аюулгүйгээр тойрно.',
    difficulty: 'easy',
    tags: ['city', 'hazard'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Гудамжны нохой хойноос хөөвөл яах вэ?',
    options: [
      { key: 'A', text: 'Эргэж нохойг харах', isCorrect: false },
      { key: 'B', text: 'Чиглэлээ тогтвортой хадгалж явах', isCorrect: true },
      { key: 'C', text: 'Гэнэт эргэх', isCorrect: false },
      { key: 'D', text: 'Зогсоод зугтах', isCorrect: false },
    ],
    explanationMn: 'Чиглэлээ алдалгүй тогтвортой явснаар тэнцвэрээ хадгална.',
    difficulty: 'medium',
    tags: ['city', 'hazard'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Зогссон машины хажуугаар хэр зайтай явах вэ?',
    options: [
      { key: 'A', text: 'Шахаж явах', isCorrect: false },
      { key: 'B', text: '1 метрийн зайтай', isCorrect: true },
      { key: 'C', text: 'Шүргэн', isCorrect: false },
      { key: 'D', text: 'Зай барих шаардлагагүй', isCorrect: false },
    ],
    explanationMn: 'Хаалга гэнэт нээгдэж болзошгүй тул 1 метрийн зайтай явна.',
    difficulty: 'medium',
    tags: ['city', 'hazard'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Оройн муу гэрэлтүүлэгтэй үед юу хийх вэ?',
    options: [
      { key: 'A', text: 'Скүүтэрийн гэрлийг асаах', isCorrect: true },
      { key: 'B', text: 'Хурдаа нэмэх', isCorrect: false },
      { key: 'C', text: 'Гар утсаар гэрэлтүүлэх', isCorrect: false },
      { key: 'D', text: 'Нүдээ анивчуулах', isCorrect: false },
    ],
    explanationMn: 'Оройн цагт скүүтэрийн урд гэрлийг асааж, харагдах байдлаа сайжруулна.',
    difficulty: 'easy',
    tags: ['city', 'night'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Өвлийн мөсөн дээр жолоодохдоо юунд анхаарах вэ?',
    options: [
      { key: 'A', text: 'Хурдаа нэмэх', isCorrect: false },
      { key: 'B', text: 'Хурд бууруулж, тормосоо аажмаар хэрэглэх', isCorrect: true },
      { key: 'C', text: 'Гэнэт тормослох', isCorrect: false },
      { key: 'D', text: 'Хурдан эргэх', isCorrect: false },
    ],
    explanationMn: 'Мөсөн дээр гулгахаас сэргийлж хурдаа бууруулж, тормосоо аажмаар хэрэглэнэ.',
    difficulty: 'medium',
    tags: ['city', 'winter'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Эргэлт хийхээс өмнө юу хийх ёстой вэ?',
    options: [
      { key: 'A', text: 'Хойшоо ажиглаж, дохио өгөх', isCorrect: true },
      { key: 'B', text: 'Шууд эргэх', isCorrect: false },
      { key: 'C', text: 'Хурдаа нэмэх', isCorrect: false },
      { key: 'D', text: 'Нүдээ аних', isCorrect: false },
    ],
    explanationMn: 'Эргэхээс өмнө хойшоо ажиглаж, гараараа дохио өгнө.',
    difficulty: 'easy',
    tags: ['city', 'turn'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Бороотой үед зам ямар болох вэ?',
    options: [
      { key: 'A', text: 'Илүү барьцтай', isCorrect: false },
      { key: 'B', text: 'Гулгамтгай болж, тормосны зам уртасна', isCorrect: true },
      { key: 'C', text: 'Өөрчлөгдөхгүй', isCorrect: false },
      { key: 'D', text: 'Хатуу болно', isCorrect: false },
    ],
    explanationMn: 'Бороонд зам гулгамтгай болж, тормослоход илүү урт зам шаардана. Хурдаа бууруулна.',
    difficulty: 'medium',
    tags: ['city', 'rain'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Уулзвар дээр ирэхэд юу хийх вэ?',
    options: [
      { key: 'A', text: 'Хурдаа бууруулж, бүх талаа харах', isCorrect: true },
      { key: 'B', text: 'Хурдан гарах', isCorrect: false },
      { key: 'C', text: 'Нүдээ аних', isCorrect: false },
      { key: 'D', text: 'Дуу хөгжим тавих', isCorrect: false },
    ],
    explanationMn: 'Уулзвар дээр хурдаа бууруулж, зүүн баруун, хойшоо ажиглана.',
    difficulty: 'easy',
    tags: ['city', 'intersection'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Хүчтэй салхинд жолоодохдоо яах вэ?',
    options: [
      { key: 'A', text: 'Нэг гараар барих', isCorrect: false },
      { key: 'B', text: 'Хоёр гараараа бариулыг бариулж тогтвор барих', isCorrect: true },
      { key: 'C', text: 'Хурдаа нэмэх', isCorrect: false },
      { key: 'D', text: 'Гараа тавих', isCorrect: false },
    ],
    explanationMn: 'Хүчтэй салхинд тэнцвэр алдагдахаас сэргийлж хоёр гараараа барина.',
    difficulty: 'medium',
    tags: ['city', 'wind'],
  },
  {
    moduleCode: 'M3',
    questionMn: 'Хүн олон газраар дайрч өнгөрөхдөө яах вэ?',
    options: [
      { key: 'A', text: 'Хурдаа бууруулж, болгоомжтой явах', isCorrect: true },
      { key: 'B', text: 'Дуут дохио өгсөөр хурдлах', isCorrect: false },
      { key: 'C', text: 'Явган замаар гарах', isCorrect: false },
      { key: 'D', text: 'Хүмүүсийг түлхэх', isCorrect: false },
    ],
    explanationMn: 'Хүн ихтэй газар хурдаа бууруулж, аль болох хөтөлж явах нь зүйтэй.',
    difficulty: 'easy',
    tags: ['city', 'pedestrian'],
  },

  // ── Модуль 4: Эрсдэл ──
  {
    moduleCode: 'M4',
    questionMn: 'E-scooter ослын хамгийн түгээмэл шалтгаан юу вэ?',
    options: [
      { key: 'A', text: 'Хурд хэтрүүлэх (35%)', isCorrect: true },
      { key: 'B', text: 'Гар утас ашиглах', isCorrect: false },
      { key: 'C', text: 'Согтуу жолоодлого', isCorrect: false },
      { key: 'D', text: 'Цаг агаар', isCorrect: false },
    ],
    explanationMn: 'Ослын 35% нь хурд хэтрүүлснээс үүсдэг.',
    difficulty: 'medium',
    tags: ['risk', 'stats'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'SIPDE загварын S үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Scan (замыг урьдчилан харах)', isCorrect: true },
      { key: 'B', text: 'Stop', isCorrect: false },
      { key: 'C', text: 'Speed', isCorrect: false },
      { key: 'D', text: 'Safety', isCorrect: false },
    ],
    explanationMn: 'S = Scan — замын байдлыг урьдчилан ажиглана.',
    difficulty: 'medium',
    tags: ['risk', 'sipde'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'SIPDE загварын I үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Identify (аюулыг тодорхойлох)', isCorrect: true },
      { key: 'B', text: 'Ignore', isCorrect: false },
      { key: 'C', text: 'Increase', isCorrect: false },
      { key: 'D', text: 'Idle', isCorrect: false },
    ],
    explanationMn: 'I = Identify — болзошгүй аюулыг тодорхойлно.',
    difficulty: 'medium',
    tags: ['risk', 'sipde'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'SIPDE загварын P үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Predict (нөхцлийг таамаглах)', isCorrect: true },
      { key: 'B', text: 'Push', isCorrect: false },
      { key: 'C', text: 'Park', isCorrect: false },
      { key: 'D', text: 'Pause', isCorrect: false },
    ],
    explanationMn: 'P = Predict — нөхцөл байдал хэрхэн өрнөхийг таамаглана.',
    difficulty: 'medium',
    tags: ['risk', 'sipde'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'SIPDE загварын E үсэг юуг илэрхийлэх вэ?',
    options: [
      { key: 'A', text: 'Execute (шийдвэрийг гүйцэтгэх)', isCorrect: true },
      { key: 'B', text: 'Exit', isCorrect: false },
      { key: 'C', text: 'Enter', isCorrect: false },
      { key: 'D', text: 'End', isCorrect: false },
    ],
    explanationMn: 'E = Execute — гаргасан шийдвэрээ гүйцэтгэнэ.',
    difficulty: 'medium',
    tags: ['risk', 'sipde'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'Дуулгагүй явснаас үүдэлтэй ослын хувь хэд вэ?',
    options: [
      { key: 'A', text: '5%', isCorrect: false },
      { key: 'B', text: '28%', isCorrect: true },
      { key: 'C', text: '50%', isCorrect: false },
      { key: 'D', text: '70%', isCorrect: false },
    ],
    explanationMn: 'Ослын 28% нь дуулгагүй явсантай холбоотой.',
    difficulty: 'hard',
    tags: ['risk', 'stats'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'Жолоодож яваандаа гар утас хэрэглэх шаардлага гарвал яах вэ?',
    options: [
      { key: 'A', text: 'Яваандаа хэрэглэх', isCorrect: false },
      { key: 'B', text: 'Аюулгүй газар зогсоод л ашиглах', isCorrect: true },
      { key: 'C', text: 'Нэг гараар явахдаа', isCorrect: false },
      { key: 'D', text: 'Хэзээ ч авч явахгүй', isCorrect: false },
    ],
    explanationMn: 'Гар утсыг зөвхөн аюулгүй газар зогсоод ашиглана.',
    difficulty: 'easy',
    tags: ['risk', 'phone'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'Согтуу үед скүүтэр жолоодохоос хэрхэн сэргийлэх вэ?',
    options: [
      { key: 'A', text: 'Бага зэрэг ууж болно', isCorrect: false },
      { key: 'B', text: 'Огт жолоодохгүй байх', isCorrect: true },
      { key: 'C', text: 'Удаан явбал болно', isCorrect: false },
      { key: 'D', text: 'Шөнө явбал болно', isCorrect: false },
    ],
    explanationMn: 'Согтуу үед огт жолоодохгүй байх нь цорын ганц зөв сонголт.',
    difficulty: 'easy',
    tags: ['risk', 'alcohol'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'Замын нүхэнд унахаас хэрхэн сэргийлэх вэ?',
    options: [
      { key: 'A', text: 'Хурд бууруулж, замаа анхааралтай шалгах', isCorrect: true },
      { key: 'B', text: 'Хурдан явах', isCorrect: false },
      { key: 'C', text: 'Гар утас харах', isCorrect: false },
      { key: 'D', text: 'Нүд аних', isCorrect: false },
    ],
    explanationMn: 'Хурдаа бууруулж, замаа урьдчилан харснаар нүхэнд унахаас сэргийлнэ.',
    difficulty: 'easy',
    tags: ['risk', 'pothole'],
  },
  {
    moduleCode: 'M4',
    questionMn: 'Осол гарвал хамгийн түрүүнд юу хийх вэ?',
    options: [
      { key: 'A', text: 'Өөрийн аюулгүй байдлыг хангаж замаас гарах', isCorrect: true },
      { key: 'B', text: 'Зугтах', isCorrect: false },
      { key: 'C', text: 'Зураг авч нийтлэх', isCorrect: false },
      { key: 'D', text: 'Хашгирах', isCorrect: false },
    ],
    explanationMn: 'Эхлээд өөрийгөө аюулгүй болгож, дараа нь 103/102-т мэдэгдэнэ.',
    difficulty: 'medium',
    tags: ['risk', 'accident'],
  },
];

// ── ҮНИЙН БАГЦУУД ────────────────────────────────────────────────
export const packages = [
  {
    code: 'BASIC',
    name: 'Үндсэн',
    price: 19900,
    priceLabel: '',
    tier: 'BASIC',
    includesPractice: false,
    practiceSessions: 0,
    includesCard: false,
    enrollable: true,
    badge: '',
    description: 'Онлайн хичээл, шалгалт болон дижитал гэрчилгээ. Хурдан эхлэлт.',
    features: [
      '4 модуль онлайн хичээл',
      'Онлайн шалгалт (30 асуулт)',
      'Дижитал гэрчилгээ + QR',
      'Нийтийн баталгаажуулалт',
    ],
    sortOrder: 1,
  },
  {
    code: 'STANDARD',
    name: 'Стандарт',
    price: 29900,
    priceLabel: '',
    tier: 'STANDARD',
    includesPractice: true,
    practiceSessions: 1,
    includesCard: false,
    enrollable: true,
    badge: 'Эрэлттэй',
    description: 'Онлайн сургалт дээр практик дадлага нэмэгдсэн бүрэн багц.',
    features: [
      'Үндсэн багцын бүх боломж',
      '1 удаагийн практик дадлага',
      'Жолооны курст QR баталгаажуулалт',
      'Бүрэн баталгаажсан гэрчилгээ',
    ],
    sortOrder: 2,
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 49900,
    priceLabel: '',
    tier: 'PRO',
    includesPractice: true,
    practiceSessions: 2,
    includesCard: true,
    enrollable: true,
    badge: 'Шинэ',
    description: 'Хамгийн дэлгэрэнгүй багц — нэмэлт дадлага ба биет карт.',
    features: [
      'Стандарт багцын бүх боломж',
      '2 удаагийн практик дадлага',
      'Биет гэрчилгээний карт',
      'Тэргүүлэх дэмжлэг',
    ],
    sortOrder: 3,
  },
  {
    code: 'B2B',
    name: 'Байгууллага (B2B)',
    price: 25000,
    priceLabel: '25,000₮/хүн',
    tier: 'B2B',
    includesPractice: true,
    practiceSessions: 1,
    includesCard: false,
    enrollable: false,
    badge: 'Шинэ',
    description: '10+ ажилтантай байгууллагад зориулсан багц бүртгэл, хяналт.',
    features: [
      '10+ ажилтны багц бүртгэл',
      'Стандарт багцын бүх боломж',
      'Байгууллагын тайлан, хяналт',
      'Гэрээт төлбөр',
    ],
    sortOrder: 4,
  },
  {
    code: 'API',
    name: 'API жилийн лиценз',
    price: 0,
    priceLabel: 'Жилийн лиценз',
    tier: 'API',
    includesPractice: false,
    practiceSessions: 0,
    includesCard: false,
    enrollable: false,
    badge: '',
    description: 'Скүүтэр түрээс болон бусад аппликейшн холбогдох API лиценз.',
    features: [
      'Сертификат шалгах API',
      'Урамшуулал олгох API',
      'Хэрэглэгч холболтын API',
      'Түрээсийн апп интеграц',
    ],
    sortOrder: 5,
  },
];

// ── ХАМТРАГЧ КОМПАНИУД (Судалгааны 1.5) ──────────────────────────
export const partners = [
  {
    name: 'Jet Sharing Mongolia',
    code: 'JET',
    appName: 'JET App',
    rewardPoints: 1000,
    discountPercent: 10,
    logoColor: '#FF5A1F',
    scooterCount: '~6,000 скүүтэр',
    description: 'Монголын хамгийн том скүүтэр түрээсийн платформ. Сургалт төгсөгчдөд 1,000 оноо + 30 минут үнэгүй.',
  },
  {
    name: 'Tabo (VMC Group)',
    code: 'TABO',
    appName: 'Tabo / Tapa Trip',
    rewardPoints: 500,
    discountPercent: 15,
    logoColor: '#16A34A',
    scooterCount: '~1,500 скүүтэр',
    description: 'VMC группын скүүтэр түрээс. 500 оноо + 15% хөнгөлөлт.',
  },
  {
    name: 'Eco Bike',
    code: 'ECOBIKE',
    appName: 'Eco Bike App',
    rewardPoints: 500,
    discountPercent: 0,
    logoColor: '#0EA5E9',
    scooterCount: '~2,500 цахилгаан дугуй',
    description: 'Цахилгаан дугуй түрээсийн үйлчилгээ. Сургалт төгсөгчдөд 500 оноо.',
  },
  {
    name: 'GoGo Scooter',
    code: 'GOGO',
    appName: 'GoGo App',
    rewardPoints: 500,
    discountPercent: 10,
    logoColor: '#9333EA',
    scooterCount: 'Тодорхойлогдсон',
    description: 'Хотын скүүтэр түрээс. Урамшуулал тохиролцлоор.',
  },
  {
    name: 'Flash',
    code: 'FLASH',
    appName: 'Flash App',
    rewardPoints: 500,
    discountPercent: 10,
    logoColor: '#EAB308',
    scooterCount: 'Тодорхойлогдсон',
    description: 'Шуурхай скүүтэр түрээс. Урамшуулал тохиролцлоор.',
  },
  {
    name: 'ScootMN',
    code: 'SCOOTMN',
    appName: 'ScootMN',
    rewardPoints: 500,
    discountPercent: 10,
    logoColor: '#EC4899',
    scooterCount: 'Тодорхойлогдсон',
    description: 'Дотоодын скүүтэр түрээсийн үйлчилгээ.',
  },
  {
    name: 'Bird.mn',
    code: 'BIRD',
    appName: 'Bird Platform',
    rewardPoints: 500,
    discountPercent: 10,
    logoColor: '#1B448A',
    scooterCount: 'Тодорхойлогдсон',
    description: 'Олон улсын Bird платформын Монгол дахь үйлчилгээ.',
  },
];

// ── ГЭРЭЭТ ЖОЛООНЫ КУРС (дадлагын талбай) ────────────────────────
export const drivingSchools = [
  {
    name: 'УБ Драйв Жолооны Сургууль',
    address: 'Сүхбаатар дүүрэг, 1-р хороо, Энхтайваны өргөн чөлөө 25',
    district: 'Сүхбаатар',
    lat: 47.918,
    lng: 106.917,
    phone: '7011-2233',
    contractNumber: 'DS-2026-001',
    capacityPerDay: 30,
  },
  {
    name: 'Сэлбэ Дадлагын Талбай',
    address: 'Баянгол дүүрэг, 5-р хороо, Дунд гол гудамж 14',
    district: 'Баянгол',
    lat: 47.905,
    lng: 106.86,
    phone: '7022-4455',
    contractNumber: 'DS-2026-002',
    capacityPerDay: 20,
  },
  {
    name: 'Хан-Уул Скүүтэр Дадлага',
    address: 'Хан-Уул дүүрэг, 15-р хороо, Чингисийн өргөн чөлөө 8',
    district: 'Хан-Уул',
    lat: 47.886,
    lng: 106.91,
    phone: '7033-6677',
    contractNumber: 'DS-2026-003',
    capacityPerDay: 25,
  },
];

// ── ПРАКТИК ДАДЛАГЫН ЭЛЕМЕНТҮҮД (Судалгааны 9.1) ─────────────────
export const practiceElements = [
  { code: 'A', titleMn: 'Эхлэх, зогсох', criteria: 'Жигд эхлэх, аюулгүй зогсох', durationMin: 20 },
  { code: 'B', titleMn: 'Шулуун явах', criteria: 'Нарийн шугам дагах', durationMin: 20 },
  { code: 'C', titleMn: 'Эргэлт (баруун/зүүн/U)', criteria: 'Зөв эргэлт', durationMin: 30 },
  { code: 'D', titleMn: 'Саад давах (шон тойрох)', criteria: 'Нарийн замаар нэвтрэх', durationMin: 30 },
  { code: 'E', titleMn: 'Гар хурдаар явах', criteria: 'Тэнцвэр хадгалах', durationMin: 20 },
  { code: 'F', titleMn: 'Яаралтай зогсолт', criteria: '7 метрт зогсох', durationMin: 20 },
  { code: 'G', titleMn: 'Замын хөдөлгөөнд нэгдэх', criteria: 'Зөв ажиглалт, эргэлт', durationMin: 30 },
];
