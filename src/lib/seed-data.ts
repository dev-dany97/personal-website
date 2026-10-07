import type { DatabaseSync } from 'node:sqlite';

// One-time seed of the SQLite database from the content that used to be
// hardcoded directly in the page components. This is the source of truth
// until an editing UI exists — delete data/content.db to reseed from here.

// Large video files are hosted on S3/CloudFront rather than bundled under
// /public (they'd blow past GitHub's file size limit and bloat every
// deploy). Falls back to the local /public/videos path when unset, e.g.
// for local dev.
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';

export function seedDatabase(db: DatabaseSync) {
  db.exec('BEGIN');
  try {
    seedPageContent(db);
    seedHome(db);
    seedProjects(db);
    seedTravel(db);
    seedSetup(db);
    seedFinance(db);
    seedResume(db);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function insertPage(db: DatabaseSync, page: string, en: unknown, de: unknown) {
  db.prepare('INSERT INTO page_content (page, data_en, data_de) VALUES (?, ?, ?)').run(
    page,
    JSON.stringify(en),
    JSON.stringify(de)
  );
}

function seedPageContent(db: DatabaseSync) {
  insertPage(
    db,
    'home',
    {
      heroTitle1: 'Welcome to my',
      heroTitle2: 'Website',
      heroSubtitle: "I'm glad you're here.",
      heroCta: 'More about me',
      aboutHeading: "Hi, I'm Daniel!",
      aboutIntro: [
        "I'm {age} years old, a software developer, sailor, tech nerd, gamer, and above all someone who loves trying new things and figuring out how they work. That curiosity is, among other things, exactly why this website exists.",
        "Here I don't just want to tell you a bit about myself — I also want to share my projects, travels, experiences, and interests with you. Maybe you'll even find an idea or two that inspires you."
      ],
      aboutMoreLabel: 'Read more',
      aboutLessLabel: 'Show less',
      aboutSections: [
        {
          heading: 'From hobby to profession and somehow back again',
          image: '/images/about/hobby-zum-beruf.jpg',
          paragraphs: [
            "I've been working as a software developer for seven years now. But programming isn't just a job for me. In my free time, I also love tinkering with my own projects, trying out new technologies, or making everyday things a little bit smarter.",
            "That's resulted in everything from small software projects to smart home setups (like Home Assistant), electronics tinkering, or just things I wanted to try out of pure curiosity.",
            'If that sounds interesting, feel free to check out my [personal projects](/projects). You’ll find both finished projects and things I’m still working on.'
          ]
        },
        {
          heading: 'At some point, sailing came into the picture …',
          image: '/images/about/segeln.jpg',
          paragraphs: [
            'As you can probably already tell from my profile picture, sailing has become one of my biggest passions alongside technology.',
            'It actually started a bit differently about five years ago: with a motorboat license.',
            "After the first few longer trips, I quickly realized that pure motorboating didn't really fulfill me. Just going from A to B got a bit too monotonous over time, and it's famously not exactly cheap either.",
            'I ended up discovering sailing more or less by chance, through a student sailing trip, and I was immediately hooked by the connection to nature combined with that feeling of freedom.',
            "At the same time, I also knew I didn't want to permanently depend on someone else deciding when and where to sail, always with strangers along for the ride. So it was clear to me that I wanted to be out there as a skipper myself one day.",
            'The next logical step was therefore the SKS (Sport Coastal Skipper) license.',
            "I quickly learned, though, that a sailing license isn't comparable to a driver's license. Just because you've passed the exam doesn't mean you can safely handle a yacht in every situation.",
            'So more skipper training and additional qualifications followed — including the SRC radio license for VHF marine radio, as well as the corresponding certificate for pyrotechnic distress signals.',
            'Especially the practical training showed me how much there still is to learn about sailing, even after passing the exams.',
            'By now I plan and organize my own sailing trips and try to explore new sailing areas almost every year.',
            "If you'd like to follow my trips and sailing adventures, feel free to check out the [travel section](/travel)."
          ]
        },
        {
          heading: 'Why finance eventually became just as interesting to me',
          image: '/images/about/finanzen.jpg',
          paragraphs: [
            "Besides my job and my hobbies — which, alongside sailing, also include skiing and tennis — I've been digging deeper into my own finances and investing for a few years now.",
            "The reason is actually pretty simple: I don't want to be financially dependent on a single source of income.",
            "A job that feels secure isn't automatically a guarantee for the future. Illness, an accident, economic shifts, a company going bankrupt, or technological developments like AI can change career paths faster than you might expect.",
            "At the same time, I've long felt that financial education plays a surprisingly small role in our society.",
            "It wasn't any different for me at first. I learned a lot in school, but almost nothing about how building wealth actually works, what stocks and ETFs even are, how to assess risk, or why it can make sense to deal with your finances as early as possible. That's exactly why I find this topic all the more important.",
            "My own educational path wasn't exactly a straight line either. I started at a Hauptschule (Germany's lower-tier secondary school), worked my way up step by step to a high school diploma, and eventually went to university — ending up with a master's degree.",
            'During my studies, I even had the chance to take a PhD position in Brisbane, Australia. As exciting as that opportunity was, I ultimately decided against it. I find research interesting, but I realized I’d rather work hands-on, build things, and actually see what comes out of it in the end.',
            'My time and experiences in Australia also changed how I see Germany, work, and financial security. They reinforced my decision to dig deeper into building wealth and long-term financial planning.',
            "That said, I'm not trying to tell anyone on this website how to invest their money. Instead, I want to show how I go about it myself — the decisions I make, the mistakes I've made, and what I learned from them.",
            'Because I started small too.',
            "And that's exactly why I know getting started can sometimes feel more complicated than it actually has to be. At the same time, you notice over time what a difference it makes to start early and stick with it consistently.",
            'During my studies, I also joined a student investing club. Looking back, that was one of the best ways to really get into the topic. What I valued most was exchanging ideas with others — from fellow students who were just getting started themselves to members with years of experience.',
            "It wasn't just about stocks or investments, either. I met a lot of open, warm people there, with whom I could share a common interest and learn from at the same time.",
            "Especially if you're new to this topic, I can only recommend talking to others and getting to know different perspectives.",
            "If you're interested in my personal approach to investing, or want to see the trades and decisions I make myself, you'll find more in the [finance section](/finance)."
          ]
        },
        {
          heading: 'And then there’s probably my strongest and longest-running passion …',
          image: '/images/about/gaming.jpg',
          paragraphs: [
            'My probably oldest passion has been with me since I was about seven years old: video games.',
            'It all started with a PlayStation 2, a Game Boy, and eventually a pretty old PC.',
            'What started out as just playing games slowly turned into an interest in the technology behind them. At some point I no longer just wanted to know which game ran on my PC, but why it ran.',
            'How does a processor actually work? What happens in RAM? How does software communicate with hardware? And what happens at the lower levels, all the way down to machine instructions and assembly?',
            'The more I learned about it, the more interested I became in building my own PC.',
            "And that's how a little never-ending story began.",
            'A fairly normal PC with classic air cooling eventually turned into an ever more optimized system. New hardware, better cooling, RGB lighting, cable management, different case concepts — all the way to a fully custom water-cooled build.',
            'And as is usually the case with hobbies like this, a PC is never really "finished" … For me, that’s been going on for 5 years now…',
            "You can find what I'm currently playing and which hardware I use in the [gaming section](/setup)."
          ]
        },
        {
          heading: "So that's me",
          image: '/images/about/das-bin-ich.jpg',
          paragraphs: [
            'Software development, sailing, travel, finance, tech, gaming — at first glance, maybe pretty different topics.',
            "But to me, they all have something in common: I love trying things out, I want to understand how they work, and I'm always trying to keep growing.",
            "That's exactly what this website is about.",
            "If any of it is interesting, helpful, or just entertaining for you, then this site has already done its job."
          ]
        }
      ],
      aerialEyebrow: 'Drone Photography',
      aerialTitle: 'A view from above',
      aerialLead:
        "I fly a DJI Mavic 3 to take photos of landscapes from a different angle. Here are some of my favorite shots around Regensburg — and the sunset that got me started."
    },
    {
      heroTitle1: 'Willkommen auf meiner',
      heroTitle2: 'Webseite',
      heroSubtitle: 'Schön, dass du meine Webseite besuchst.',
      heroCta: 'Mehr über mich',
      aboutHeading: 'Hi, ich bin Daniel!',
      aboutIntro: [
        'Ich bin {age} Jahre alt, Softwareentwickler, Segler, Technik-Nerd, Gamer und vor allem jemand, der gerne neue Dinge ausprobiert und verstehen möchte, wie sie funktionieren. Genau diese Neugier hat unter anderem auch dazu geführt, dass diese Webseite entstanden ist.',
        'Hier möchte ich nicht nur ein bisschen über mich erzählen, sondern auch meine Projekte, Reisen, Erfahrungen und Interessen mit dir teilen. Vielleicht findest du dabei ja sogar die eine oder andere Idee, die dich selbst inspiriert.'
      ],
      aboutMoreLabel: 'Mehr lesen',
      aboutLessLabel: 'Weniger anzeigen',
      aboutSections: [
        {
          heading: 'Vom Hobby zum Beruf und irgendwie wieder zurück',
          image: '/images/about/hobby-zum-beruf.jpg',
          paragraphs: [
            'Seit mittlerweile sieben Jahren arbeite ich als Softwareentwickler. Das Programmieren ist für mich allerdings nicht nur ein Beruf. Auch in meiner Freizeit tüftle ich gerne an eigenen Projekten, probiere neue Technologien aus oder versuche, alltägliche Dinge ein kleines bisschen smarter zu machen.',
            'Dabei entstehen mal kleinere Softwareprojekte, mal Smart-Home-Lösungen (wie Home-Assistant), Elektronik-Basteleien oder einfach Dinge, die ich aus Interesse ausprobieren wollte.',
            'Wenn dich das interessiert, kannst du gerne bei meinen [privaten Projekten](/projects) vorbeischauen. Dort findest du sowohl bereits abgeschlossene Projekte als auch Dinge, an denen ich aktuell noch arbeite.'
          ]
        },
        {
          heading: 'Irgendwann kam das Segeln dazu …',
          image: '/images/about/segeln.jpg',
          paragraphs: [
            'Wie du wahrscheinlich schon an meinem Profilbild erkennen kannst, gehört neben der Technik inzwischen auch das Segeln zu meinen größten Leidenschaften.',
            'Angefangen hat das Ganze vor ungefähr fünf Jahren allerdings etwas anders: mit einem Motorbootführerschein.',
            'Nach den ersten längeren Fahrten habe ich relativ schnell festgestellt, dass mich reines Motorbootfahren nicht wirklich erfüllt. Einfach nur von A nach B zu fahren, wurde mir auf Dauer etwas zu eintönig und günstig ist das Ganze bekanntlich auch nicht gerade.',
            'Durch einen Studenten-Segeltörn bin ich schließlich eher zufällig beim Segeln gelandet und mich hat die Naturverbundenheit in Verbindung mit einem Freiheitsgefühl sofort begeistert.',
            'Gleichzeitig wusste ich aber auch: Ich möchte nicht dauerhaft darauf angewiesen sein, dass jemand anderes entscheidet, wann und wohin gesegelt wird und auch immer mit fremden Leuten. Also stand für mich fest, dass ich irgendwann selbst als Skipper unterwegs sein möchte.',
            'Der nächste logische Schritt war deshalb der Sportküstenschifferschein, kurz SKS.',
            'Dabei habe ich allerdings schnell gelernt, dass ein Segelschein nicht mit einem Autoführerschein vergleichbar ist. Nur weil man die Prüfung bestanden hat, bedeutet das noch lange nicht, dass man eine Yacht in jeder Situation sicher beherrscht.',
            'Deshalb folgten weitere Skippertrainings und zusätzliche Qualifikationen – unter anderem der SRC-Funkschein für den UKW-Seefunk sowie der entsprechende Fachkundenachweis für pyrotechnische Seenotsignalmittel.',
            'Vor allem die praktischen Trainings haben mir gezeigt, wie viel es beim Segeln auch nach den Prüfungen noch zu lernen gibt.',
            'Mittlerweile plane und organisiere ich eigene Segeltörns und versuche, fast jedes Jahr neue Reviere kennenzulernen.',
            'Wenn du meine Reise und Segelabenteuer verfolgen möchtest, schau gerne im [Bereich Reisen](/travel) vorbei.'
          ]
        },
        {
          heading: 'Warum mich Finanzen irgendwann genauso interessiert haben',
          image: '/images/about/finanzen.jpg',
          paragraphs: [
            'Neben meinem Beruf und meinen Hobbys, zu denen neben dem Segeln unter anderem auch Skifahren und Tennis gehören, beschäftige ich mich seit einigen Jahren intensiver mit meinen eigenen Finanzen und dem Thema Geldanlage.',
            'Der Grund dafür ist eigentlich ziemlich einfach: Ich möchte finanziell nicht ausschließlich von einem einzigen Einkommen abhängig sein.',
            'Ein sicher geglaubter Arbeitsplatz ist nicht automatisch eine Garantie für die Zukunft. Krankheit, ein Unfall, wirtschaftliche Veränderungen, die Insolvenz eines Unternehmens oder technologische Entwicklungen wie künstliche Intelligenz können Berufswege schneller verändern, als man vielleicht erwartet.',
            'Gleichzeitig hatte ich lange das Gefühl, dass finanzielle Bildung in unserer Gesellschaft eine erstaunlich kleine Rolle spielt.',
            'Mir ging es anfangs selbst nicht anders. In der Schule habe ich viel gelernt, aber kaum etwas darüber, wie Vermögensaufbau funktioniert, was Aktien und ETFs eigentlich sind, wie man Risiken einschätzt oder warum es sinnvoll sein kann, sich möglichst früh mit seinen Finanzen auseinanderzusetzen. Gerade deshalb finde ich dieses Thema umso wichtiger.',
            'Mein eigener Bildungsweg war dabei auch nicht unbedingt geradlinig. Ich habe auf der Hauptschule angefangen, mich anschließend Schritt für Schritt bis zum Abitur weitergearbeitet und schließlich studiert. Am Ende habe ich meinen Masterabschluss gemacht.',
            'Während meines Studiums ergab sich sogar die Möglichkeit einer Doktorandenstelle in Brisbane (Australien). So spannend diese Chance auch war, habe ich mich letztendlich dagegen entschieden. Forschung finde ich interessant, aber ich habe gemerkt, dass ich lieber praktisch arbeite, Dinge entwickle und am Ende auch sehe, was daraus entsteht.',
            'Auch meine Zeit und Erfahrungen in Australien haben meine Sicht auf Deutschland, Arbeit und finanzielle Absicherung verändert. Sie haben mich noch einmal darin bestärkt, mich intensiver mit Vermögensaufbau und langfristiger finanzieller Planung auseinanderzusetzen.',
            'Dabei möchte ich auf dieser Webseite allerdings niemandem erzählen, wie er sein Geld anzulegen hat. Stattdessen möchte ich zeigen, wie ich selbst vorgehe, welche Entscheidungen ich treffe, welche Fehler ich gemacht habe und was ich daraus gelernt habe.',
            'Denn auch ich habe klein angefangen.',
            'Und genau deshalb weiß ich, dass der Einstieg manchmal komplizierter wirkt, als er eigentlich sein muss. Gleichzeitig merkt man mit der Zeit, welchen Unterschied es macht, früh anzufangen und konsequent dranzubleiben.',
            'Während meines Studiums bin ich außerdem einem Börsenverein beigetreten. Rückblickend war das eine der besten Möglichkeiten, um tiefer in das Thema einzusteigen. Besonders wertvoll war für mich der Austausch mit anderen – von Studierenden, die selbst gerade erst angefangen hatten, bis hin zu Mitgliedern mit jahrelanger Erfahrung.',
            'Dabei ging es nicht nur um Aktien oder Investments. Ich habe dort viele offene und herzliche Menschen kennengelernt, mit denen man ein gemeinsames Interesse teilen und gleichzeitig voneinander lernen konnte.',
            'Gerade wenn man neu in diesem Bereich ist, kann ich deshalb nur empfehlen, sich mit anderen auszutauschen und unterschiedliche Sichtweisen kennenzulernen.',
            'Wenn dich meine persönliche Herangehensweise an Investments interessiert oder du sehen möchtest, welche Trades und Entscheidungen ich selbst treffe, findest du mehr dazu im [Bereich Finanzen](/finance).'
          ]
        },
        {
          heading: 'Und dann wäre da noch meine wahrscheinlich stärkste und längste Leidenschaft …',
          image: '/images/about/gaming.jpg',
          paragraphs: [
            'Meine wahrscheinlich älteste Leidenschaft begleitet mich nämlich schon, seit ich ungefähr sieben Jahre alt bin: Videospiele.',
            'Angefangen hat alles mit einer PlayStation 2, einem Game Boy und irgendwann einem ziemlich alten PC.',
            'Was zunächst einfach nur Spielen war, entwickelte sich mit der Zeit immer mehr zu einem Interesse an der Technik dahinter. Irgendwann wollte ich nicht mehr nur wissen, welches Spiel auf meinem PC läuft, sondern warum es läuft.',
            'Wie arbeitet eigentlich ein Prozessor? Was passiert im Arbeitsspeicher? Wie kommuniziert Software mit der Hardware? Und was passiert auf den unteren Ebenen bis hin zu Maschinenbefehlen und Assembler?',
            'Je mehr ich darüber gelernt habe, desto größer wurde mein Interesse daran, meinen eigenen PC zusammenzustellen.',
            'Und damit begann eine kleine Never-Ending-Story.',
            'Aus einem relativ normalen PC mit klassischer Luftkühlung wurde irgendwann ein immer weiter optimiertes System. Neue Hardware, bessere Kühlung, RGB-Beleuchtung, Kabelmanagement, verschiedene Gehäusekonzepte – bis hin zu einem komplett Custom-Wasserkühlungs-PC.',
            'Und wie das bei solchen Hobbys meistens ist, ist ein PC eigentlich nie wirklich „fertig"… Bei mir geht das schon 5 Jahre so…',
            'Was ich aktuell spiele, welche Hardware ich verwende, findest du im [Bereich Gaming](/setup).'
          ]
        },
        {
          heading: 'Das bin also ich',
          image: '/images/about/das-bin-ich.jpg',
          paragraphs: [
            'Softwareentwicklung, Segeln, Reisen, Finanzen, Technik, Gaming – auf den ersten Blick vielleicht ziemlich unterschiedliche Themen.',
            'Für mich haben sie aber alle etwas gemeinsam: Ich probiere gerne Dinge aus, möchte verstehen, wie sie funktionieren, und versuche mich ständig weiterzuentwickeln.',
            'Genau darum geht es auch auf dieser Webseite.',
            'Wenn davon etwas für dich interessant, hilfreich oder einfach unterhaltsam ist, hat die Seite schon ihren Zweck erfüllt.'
          ]
        }
      ],
      aerialEyebrow: 'Drohnen-Fotografie',
      aerialTitle: 'Eine Ansicht von oben',
      aerialLead:
        'Ich fliege eine DJI Mavic 3, um Momente und Landschaften aus einer anderen Perspektive festzuhalten. Ein paar meiner liebsten Aufnahmen rund um Regensburg — und der Sonnenuntergang, mit dem alles begann.'
    }
  );

  insertPage(
    db,
    'projects',
    {
      eyebrow: 'Portfolio',
      title: 'My Projects',
      lead: "A mix of finished projects and things I'm still working on — from home automation to trading bots. Here's an overview of what I've built so far and what I'm currently tinkering with.",
      filterAriaLabel: 'Filter projects by status',
      statTotal: 'Total Projects',
      statCompleted: 'Completed',
      statInProgress: 'In Progress',
      filters: [
        { id: 'all', label: 'All' },
        { id: 'completed', label: 'Completed' },
        { id: 'in-progress', label: 'In Progress' }
      ],
      statusLabel: { completed: 'Completed', 'in-progress': 'In Progress' },
      photos: 'photos',
      viewDetails: 'View details',
      close: 'Close',
      previousImage: 'Previous image',
      nextImage: 'Next image'
    },
    {
      eyebrow: 'Portfolio',
      title: 'Meine Projekte',
      lead: 'Eine Mischung aus fertigen Builds und laufenden Projekten — von Hausautomatisierung bis zu Trading-Bots. Hier ein Überblick über das, was ich bereits gebaut habe und woran ich gerade tüftle.',
      filterAriaLabel: 'Projekte nach Status filtern',
      statTotal: 'Projekte gesamt',
      statCompleted: 'Abgeschlossen',
      statInProgress: 'In Arbeit',
      filters: [
        { id: 'all', label: 'Alle' },
        { id: 'completed', label: 'Abgeschlossen' },
        { id: 'in-progress', label: 'In Arbeit' }
      ],
      statusLabel: { completed: 'Abgeschlossen', 'in-progress': 'In Arbeit' },
      photos: 'Fotos',
      viewDetails: 'Details ansehen',
      close: 'Schließen',
      previousImage: 'Vorheriges Bild',
      nextImage: 'Nächstes Bild'
    }
  );

  insertPage(
    db,
    'travel',
    {
      heroTitle: 'Travel Stories & Adventures',
      heroLead:
        "A few places I've visited so far — sailing along the Italian and Croatian coast, exploring Dubai's skyline, taking boats through Bangkok's canals, watching VALORANT Champions live in Paris, hiking on the Canary Islands, and road-tripping through Italy and Australia.",
      photos: 'photos',
      viewGallery: 'View Gallery'
    },
    {
      heroTitle: 'Reisegeschichten & Abenteuer',
      heroLead:
        'Ein paar Orte, die ich bisher erkundet habe — Segeln an der italienischen und kroatischen Küste, Dubais Skyline erkunden, Bangkoks Kanäle durchqueren, die VALORANT Champions in Paris live erleben, Wandern auf den Kanarischen Inseln, und Roadtrips durch Italien und Australien.',
      photos: 'Fotos',
      viewGallery: 'Galerie ansehen'
    }
  );

  insertPage(
    db,
    'setup',
    {
      title: 'My Gaming Setup',
      lead: 'Hey gaming fans! 👾🎮 I want to show you my gaming PC, built for long gaming sessions. 🚀',
      highEndTitle: 'High-End Build',
      highEndDesc: 'My main PC — full custom water cooling, built for performance and a nice RGB look.',
      waterCoolingTitle: 'My Water Cooling Setup',
      waterCoolingIntro: "Here's why I decided to add water cooling to my PC, and why I think it's worth it.",
      bullets: [
        { title: 'Temperature Control:', text: 'Water cools a lot better than air.' },
        { title: 'Overclocking Potential:', text: 'Lower temperatures mean you can push the hardware further.' },
        { title: 'Silent Operation:', text: 'The PC runs a lot quieter.' },
        { title: 'Component Protection:', text: 'Better temperatures can help your hardware last longer.' }
      ],
      tipsTitle: 'A few tips',
      tipsText:
        "Before you build your own water cooling loop, here are a few tips. Water cooling works great, but it also has risks — leaks, corrosion, and it needs some maintenance. If you plan it well and test for leaks first, it can look great and still be reliable.",
      explore3dTitle: 'Explore the build in 3D',
      explore3dText: 'A simple 3D model of the loop. Drag to rotate it, scroll to zoom, and hover or click on a part to see what it is.',
      componentsPhotoTitle: 'Everything that went into this build',
      componentsPhotoCaption: 'Every box, before I put in a single screw.',
      componentsPhotoAlt: 'All the parts for the high-end PC build, unboxed and laid out',
      secondBuildTitle: 'Second Build',
      secondBuildDesc: 'A second PC I built — a clean NZXT case with air cooling.',
      hardwareTitle: 'Hardware',
      hardwareDisclaimer: "⚠️ Not final yet — I still need to check the exact parts in this build, so the specs below are just examples for now."
    },
    {
      title: 'Mein Gaming-Setup',
      lead: 'Hey Gaming-Fans! 👾🎮 Ich freue mich, euch meinen ultimativen Gaming-PC für grenzenlose Gaming-Abenteuer vorzustellen. 🚀',
      highEndTitle: 'High-End Build',
      highEndDesc: 'Mein Hauptrechner — komplett individuelle Wasserkühlung, gebaut für Performance und RGB-Show.',
      waterCoolingTitle: 'Wasserkühlung meistern: Eine individuelle Reise',
      waterCoolingIntro: 'Ich möchte kurz auf die Vorteile von Wasserkühlung eingehen und erklären, warum ich mich entschieden habe, meinen Computer mit einer Wasserkühlung auszustatten.',
      bullets: [
        { title: 'Temperaturkontrolle:', text: 'Wasserkühlung leitet Wärme deutlich effizienter ab als Luft.' },
        { title: 'Overclocking-Potenzial:', text: 'Niedrigere Temperaturen ermöglichen aggressiveres Tuning.' },
        { title: 'Leiser Betrieb:', text: 'Die Systemlautstärke wird deutlich reduziert.' },
        { title: 'Komponentenschutz:', text: 'Bessere thermische Stabilität kann die Lebensdauer der Hardware verlängern.' }
      ],
      tipsTitle: 'Ein paar wichtige Dinge...',
      tipsText:
        'Bevor du selbst mit einer Wasserkühlung anfängst, möchte ich dir ein paar Tipps mit auf den Weg geben. Wasserkühlung senkt die Temperatur effizient, bringt aber auch Risiken wie Lecks, Korrosion und Wartungsaufwand mit sich. Mit sorgfältiger Planung und Drucktests kann das System sowohl schön als auch zuverlässig sein.',
      explore3dTitle: 'Den Build in 3D erkunden',
      explore3dText: 'Eine stilisierte 3D-Darstellung des Wasserkreislaufs — ziehen zum Drehen, scrollen zum Zoomen, und über ein Teil hovern oder klicken, um mehr zu erfahren.',
      componentsPhotoTitle: 'Alles, was in diesen Build geflossen ist',
      componentsPhotoCaption: 'Jede Box, bevor auch nur eine Schraube verbaut wurde.',
      componentsPhotoAlt: 'Alle Teile für den High-End-PC-Build, ausgepackt und aufgereiht',
      secondBuildTitle: 'Zweiter Build',
      secondBuildDesc: 'Ein zweiter PC, den ich zusammengebaut habe — cleanes NZXT-Gehäuse mit Luftkühlung.',
      hardwareTitle: 'Hardware',
      hardwareDisclaimer: '⚠️ Vorläufig — ich muss die genauen Teile in diesem Build noch überprüfen, daher sind die untenstehenden Angaben vorerst Beispiele.'
    }
  );

  insertPage(
    db,
    'finance',
    {
      eyebrow: 'Finance & Investing',
      title: 'My Investment Journey',
      lead: "I've been actively trading since 2021 — my focus is on short-term crypto trading and hand-picked individual stocks rather than broad ETFs. I watch charts, price action and news daily and make my calls based on technical analysis.",
      tags: ['Crypto', 'Day-Trading', 'Individual Stocks', 'Chart Analysis', 'Risk Management'],
      stats: [
        { label: 'Since', value: '2021' },
        { label: 'Focus', value: 'Individual Stocks' },
        { label: 'Approach', value: 'Crypto Day-Trader' },
        { label: 'Style', value: 'Technical' }
      ],
      strategyTitle: 'What guides my strategy',
      focusAreas: [
        'Active day-trading in the crypto market',
        'Targeted positions in hand-picked individual stocks',
        'Technical chart analysis over gut feeling',
        'Watching price action and news daily'
      ],
      platformsTitle: 'Where I invest & connect',
      platformsLead: "The platforms I trade on and the community I'm part of.",
      resourcesTitle: 'Resources I use'
    },
    {
      eyebrow: 'Finanzen & Investieren',
      title: 'Meine Investment-Reise',
      lead: 'Ich handle seit 2021 aktiv — mein Fokus liegt auf kurzfristigem Krypto-Trading und ausgewählten Einzelaktien statt breit gestreuten ETFs. Ich beobachte Charts, Kursbewegungen und Nachrichtenlage täglich und treffe meine Entscheidungen technisch fundiert.',
      tags: ['Krypto', 'Day-Trading', 'Einzelaktien', 'Chartanalyse', 'Risikomanagement'],
      stats: [
        { label: 'Seit', value: '2021' },
        { label: 'Fokus', value: 'Einzelaktien' },
        { label: 'Ansatz', value: 'Krypto Day-Trader' },
        { label: 'Stil', value: 'Technisch' }
      ],
      strategyTitle: 'Was meine Strategie leitet',
      focusAreas: [
        'Aktives Day-Trading im Kryptomarkt',
        'Gezielte Positionen in ausgewählten Einzelaktien',
        'Technische Chartanalyse statt Bauchgefühl',
        'Tägliches Beobachten von Kursbewegungen und News'
      ],
      platformsTitle: 'Wo ich investiere & mich vernetze',
      platformsLead: 'Die Plattformen, auf denen ich handle, und die Community, deren Teil ich bin.',
      resourcesTitle: 'Ressourcen, die ich nutze'
    }
  );

  insertPage(
    db,
    'contact',
    {
      eyebrow: 'Contact',
      title: "Let's Connect",
      lead: "Got a question, a project idea, or just want to say hi? Drop me a message and I'll get back to you as soon as I can.",
      sendMessage: 'Send a Message',
      successMessage: "Thanks for reaching out! Your message is on its way and I'll get back to you soon.",
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      emailErrorPrefix: 'Email',
      messageLabel: 'Message',
      messagePlaceholder: "Tell me what's on your mind...",
      messageErrorPrefix: 'Message',
      sending: 'Sending...',
      send: 'Send Message',
      professionalTitle: 'Computer Scientist M.Sc. | Software Engineer'
    },
    {
      eyebrow: 'Kontakt',
      title: 'Lass uns in Kontakt treten',
      lead: 'Hast du eine Frage, eine Projektidee oder möchtest einfach Hallo sagen? Schreib mir eine Nachricht — ich melde mich so schnell wie möglich zurück.',
      sendMessage: 'Nachricht senden',
      successMessage: 'Danke für deine Nachricht! Sie ist auf dem Weg und ich melde mich bald bei dir zurück.',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'du@beispiel.de',
      emailErrorPrefix: 'E-Mail',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Was möchtest du mir mitteilen...',
      messageErrorPrefix: 'Nachricht',
      sending: 'Wird gesendet...',
      send: 'Nachricht senden',
      professionalTitle: 'Informatiker M.Sc. | Software Engineer'
    }
  );

  insertPage(
    db,
    'resume',
    {
      eyebrow: 'Background',
      title: 'A Quick Look at My Path',
      lead: "From radar software to cloud tools — here's a short overview of where I've worked, what I studied, and what I've learned along the way.",
      experienceTitle: 'Experience',
      educationTitle: 'Education',
      skillsTitle: 'Skills & Tools',
      certificatesTitle: 'Certificates'
    },
    {
      eyebrow: 'Werdegang',
      title: 'Ein kurzer Überblick über meinen Weg',
      lead: 'Von eingebetteter Radar-Software bis zu Cloud-Tooling — hier ein kompakter Überblick über meine Stationen, mein Studium und was ich dabei mitgenommen habe.',
      experienceTitle: 'Berufserfahrung',
      educationTitle: 'Ausbildung',
      skillsTitle: 'Skills & Tools',
      certificatesTitle: 'Zertifikate'
    }
  );
}

function seedHome(db: DatabaseSync) {
  const shots = [
    {
      image: '/images/projects/dji-photo-1.jpg',
      title_en: 'Regensburg Nord',
      title_de: 'Regensburg Nord',
      description_en:
        "This photo was taken in 2022 on the Winzerer Höhen in the north of Regensburg. From up here, the view opens out over the city's northern outskirts toward Adlersberg and Tremmelhauserhöhe.\n\nBetween fields, meadows, and small villages, plenty of farmland and farmsteads still shape this area today. That contrast with the city center, just a few kilometers away, shows a different side of Regensburg: quiet, spacious, and surprisingly close to nature.",
      description_de:
        'Dieses Foto entstand 2022 auf den Winzerer Höhen im Norden Regensburgs. Von hier aus öffnet sich der Blick über die nördlichen Ausläufer der Stadt in Richtung Adlersberg und Tremmelhauserhöhe.\n\nZwischen Feldern, Wiesen und kleinen Ortschaften liegen noch heute zahlreiche landwirtschaftlich geprägte Flächen und Höfe. Gerade dieser Kontrast zur nur wenige Kilometer entfernten Innenstadt zeigt eine andere Seite Regensburgs: ruhig, weitläufig und überraschend naturverbunden.'
    },
    {
      image: '/images/projects/dji-photo-2.jpg',
      title_en: 'Lupburg',
      title_de: 'Lupburg',
      description_en:
        "Lupburg is a small market town in the Upper Palatinate Jura, not far from Parsberg. With around 2,500 residents, it's surrounded by a wide landscape of forests, meadows, and fields.\n\nWhat I love about this photo is how closely the village and nature are woven together here. At the same time, the tall wind turbines on the horizon shape the modern landscape and stand as a symbol of the shift toward renewable energy.\n\nFor me, Lupburg is one of the most beautiful and lovable places in this area — quiet, rural, and with exactly the charm I associate with the Upper Palatinate.",
      description_de:
        'Lupburg ist eine kleine Marktgemeinde im Oberpfälzer Jura, unweit von Parsberg. Mit seinen rund 2.500 Einwohnern ist der Ort von einer weitläufigen Landschaft aus Wäldern, Wiesen und Feldern umgeben.\n\nDas Foto zeigt für mich besonders schön, wie eng Dorf und Natur hier miteinander verbunden sind. Gleichzeitig prägen die hoch aufragenden Windräder am Horizont das moderne Landschaftsbild und stehen sinnbildlich für den Wandel hin zu erneuerbaren Energien.\n\nLupburg gehört für mich zu den schönsten und liebenswertesten Orten in dieser Gegend – ruhig, ländlich und mit genau dem Charme, den ich mit der Oberpfalz verbinde.'
    },
    {
      image: '/images/projects/dji-photo-3.jpg',
      title_en: 'Regensburg Süd',
      title_de: 'Regensburg Süd',
      description_en:
        "Looking south over Regensburg, it becomes clear how much the city has grown and developed over the past few decades.\n\nIn the background lies Burgweinting-Harting, among other areas — today one of Regensburg's larger districts. Where fields and small settlements once shaped the landscape, residential areas, commercial zones, and transport infrastructure now meet the still-expansive countryside surrounding the city.\n\nFrom the air, this transition between city and nature becomes especially clear.",
      description_de:
        'Richtet man den Blick in den Süden Regensburgs, wird deutlich, wie stark sich die Stadt über die vergangenen Jahrzehnte entwickelt und ausgedehnt hat.\n\nIm Hintergrund erstreckt sich unter anderem Burgweinting-Harting, heute einer der größeren Stadtbezirke Regensburgs. Wo früher vor allem Felder und kleinere Siedlungen das Landschaftsbild bestimmten, treffen heute Wohngebiete, Gewerbeflächen und Verkehrsinfrastruktur unmittelbar auf die noch immer weitläufige Landschaft rund um die Stadt.\n\nGerade aus der Luft wird dieser Übergang zwischen Stadt und Natur besonders deutlich.'
    },
    {
      image: '/images/projects/dji-photo-4.jpg',
      title_en: 'Parsberg',
      title_de: 'Parsberg',
      description_en:
        'Parsberg sits nestled in the hilly landscape of the Upper Palatinate Jura, blending history, nature, and the life of a modern small town in a special way.\n\nParsberg Castle shapes the townscape from far away. Towering above the rooftops, it’s a reminder of the town’s long history and forms a striking contrast to the surrounding residential areas, fields, and forests.\n\nFrom the air, it’s especially clear how compactly Parsberg sits within the landscape — a small town surrounded by plenty of nature and the countryside typical of the Upper Palatinate.',
      description_de:
        'Parsberg liegt eingebettet in die hügelige Landschaft des Oberpfälzer Jura und verbindet auf besondere Weise Geschichte, Natur und das Leben einer modernen Kleinstadt.\n\nSchon von Weitem prägt die Burg Parsberg das Stadtbild. Hoch über den Dächern erinnert sie an die lange Geschichte des Ortes und bildet einen markanten Kontrast zu den umliegenden Wohngebieten, Feldern und Wäldern.\n\nAus der Luft zeigt sich besonders schön, wie kompakt Parsberg in die Landschaft eingebettet ist – eine kleine Stadt, umgeben von viel Natur und typisch oberpfälzischer Landschaft.'
    },
    {
      image: '/images/projects/dji-photo-5.jpg',
      title_en: 'Winter 2021',
      title_de: 'Winter 2021',
      description_en:
        'During a brief but intense cold snap in 2021, I wanted to capture this particular moment. This photo was taken on a walk through the snow-covered forest near Steinweg.\n\nFor a short while, the snow turned a familiar path into an almost perfectly still winter landscape. The snow-laden trees, the narrow trail, and the muted atmosphere made this moment feel special to me.\n\nPrecisely because days with snow like this aren’t a given in Regensburg, I wanted to hold onto this moment.',
      description_de:
        'Während eines kurzen, aber kräftigen Wintereinbruchs im Jahr 2021 wollte ich diesen besonderen Moment festhalten. Bei einem Spaziergang durch den verschneiten Wald bei Steinweg entstand dieses Foto.\n\nFür kurze Zeit verwandelte der Schnee den vertrauten Weg in eine beinahe vollkommen ruhige Winterlandschaft. Die schneebedeckten Bäume, der schmale Weg und die gedämpfte Atmosphäre machten diesen Augenblick für mich zu etwas Besonderem.\n\nGerade weil solche ausgeprägten Wintertage in Regensburg nicht selbstverständlich sind, wollte ich diesen Moment in Erinnerung behalten.'
    },
    {
      image: '/images/projects/dji-photo-6.jpg',
      title_en: 'Winter Dusk over the Danube',
      title_de: 'Winterliche Dämmerung über der Donau',
      description_en:
        'Especially during the cold winter months, the landscape around Regensburg shows a completely different side of itself. When the surrounding fields are covered in snow and the sun slowly sets in the west, a very particular light settles over the Danube and its surroundings.\n\nThe last warm colors of the day meet the cool blues and whites of the winter landscape. For a brief moment, a mood emerges in which the otherwise lively surroundings feel almost completely still.',
      description_de:
        'Besonders in den kalten Wintermonaten zeigt sich die Landschaft rund um Regensburg von einer ganz anderen Seite. Wenn die umliegenden Felder von Schnee bedeckt sind und die Sonne im Westen langsam untergeht, legt sich ein ganz besonderes Licht über die Donau und ihre Umgebung.\n\nDie letzten warmen Farben des Tages treffen dabei auf die kühlen Blau- und Weißtöne der Winterlandschaft. Für einen kurzen Moment entsteht eine Stimmung, in der die sonst so lebendige Umgebung beinahe vollkommen ruhig wirkt.'
    },
    {
      image: '/images/projects/dji-photo-7.jpg',
      title_en: 'The Golden Hour over the Land',
      title_de: 'Die goldenen Stunden über dem Land',
      description_en:
        "Watching a sunrise or sunset never stops fascinating me. Seeing how the light slowly changes and bathes the landscape in warm gold, orange, and red tones for just a few minutes is, to me, one of the most beautiful moments of a day.\n\nThat's why I wanted to capture this sunset from the air. What impressed me most was how the last warm rays of sunlight broke through gaps in the cloud cover, casting cones of light onto the fields below.\n\nFrom the drone's perspective, you can really see just how far this particular light reaches across the landscape.",
      description_de:
        'Es fasziniert mich immer wieder, einen Sonnenauf- oder Sonnenuntergang zu beobachten. Zu sehen, wie sich das Licht langsam verändert und die Landschaft für wenige Minuten in warme Gold-, Orange- und Rottöne taucht, gehört für mich zu den schönsten Momenten eines Tages.\n\nDiesen Sonnenuntergang wollte ich deshalb aus der Luft festhalten. Besonders beeindruckend fand ich, wie die letzten warmen Sonnenstrahlen durch einzelne Öffnungen in der Wolkendecke brechen und wie Lichtkegel auf die darunterliegenden Felder fallen.\n\nAus der Perspektive der Drohne wird erst richtig sichtbar, wie weit dieses besondere Licht über die Landschaft reicht.'
    },
    {
      image: '/images/projects/dji-photo-8.jpg',
      title_en: 'Regensburg Dult',
      title_de: 'Regensburg Dult',
      description_en:
        "Twice a year, the Regensburg Dult is one of the highlights of city life. With centuries of tradition behind it, it's far more than just a fun fair, and it's deeply tied to Regensburg and Stadtamhof.\n\nIts history goes back to the Middle Ages. Over the centuries, the markets and festivities were held in different parts of the city before the Dult finally found its current home at Dultplatz in Stadtamhof.\n\nOne of its most visible landmarks is the Ferris wheel. From its gondolas, you get an extraordinary view over the rooftops of Stadtamhof, the Danube, and Regensburg's historic old town with its many towers.\n\nFrom the air, it's especially striking to see how this colorful fun fair sits right next to the old town that grew over centuries — a mix of tradition, history, and modern city life.",
      description_de:
        'Zweimal im Jahr gehört die Regensburger Dult zu den Höhepunkten des Stadtlebens. Mit ihrer jahrhundertelangen Tradition ist sie weit mehr als nur ein Volksfest und inzwischen fest mit Regensburg und Stadtamhof verbunden.\n\nIhre Geschichte reicht bis ins Mittelalter zurück. Über die Jahrhunderte fanden die Märkte und Feste an unterschiedlichen Orten der Stadt statt, bevor die Dult schließlich ihren heutigen Platz am Dultplatz in Stadtamhof fand.\n\nEines ihrer weithin sichtbaren Wahrzeichen ist das Riesenrad. Von seinen Gondeln eröffnet sich ein außergewöhnlicher Blick über die Dächer von Stadtamhof, die Donau und die historische Regensburger Altstadt mit ihren zahlreichen Türmen.\n\nGerade aus der Luft zeigt sich besonders schön, wie das farbenfrohe Volksfest unmittelbar neben der über Jahrhunderte gewachsenen Altstadt liegt – ein Zusammenspiel aus Tradition, Geschichte und modernem Stadtleben.'
    }
  ];

  const insertShot = db.prepare(
    'INSERT INTO home_aerial_shots (sort_order, image, title_en, title_de, description_en, description_de) VALUES (?, ?, ?, ?, ?, ?)'
  );
  shots.forEach((s, i) => insertShot.run(i, s.image, s.title_en, s.title_de, s.description_en, s.description_de));

  const videos = [
    {
      src: `${MEDIA_BASE_URL}/videos/sunset-intro.mp4`,
      title_en: 'Beautiful sunset',
      title_de: 'Wunderschöner Sonnenuntergang',
      description_en: 'Watch the sun go down and paint the sky in warm colors — a nice, calm way to end the day.',
      description_de: 'Erlebe, wie die Sonne anmutig untergeht und den Himmel in warme Farben taucht — ein flüchtiges Meisterwerk, das den Tag in stiller Eleganz verabschiedet.'
    },
    {
      src: `${MEDIA_BASE_URL}/videos/winter-intro.mp4`,
      title_en: 'Winter from above',
      title_de: 'Winter von oben',
      description_en: 'A snowy landscape seen from the drone — calm, white and quiet. The same hills look completely different in winter.',
      description_de: 'Eine verschneite Landschaft gleitet unter der Drohne vorbei — ruhig, weiß und still, eine andere Seite der immer gleichen Hügel.'
    },
    {
      src: `${MEDIA_BASE_URL}/videos/silvester-intro.mp4`,
      title_en: "New Year's Eve",
      title_de: 'Silvester',
      description_en: "Fireworks light up the night sky on New Year's Eve, filmed from above as the old year turns into the new one.",
      description_de: 'Feuerwerk erleuchtet den Nachthimmel an Silvester, von oben eingefangen, während das alte Jahr dem neuen weicht.'
    }
  ];

  const insertVideo = db.prepare(
    'INSERT INTO home_videos (sort_order, src, title_en, title_de, description_en, description_de) VALUES (?, ?, ?, ?, ?, ?)'
  );
  videos.forEach((v, i) => insertVideo.run(i, v.src, v.title_en, v.title_de, v.description_en, v.description_de));
}

function seedProjects(db: DatabaseSync) {
  const projects = [
    {
      id: 'bike-tracker',
      image: '/images/projects/gpstracker.png',
      images: null as string[] | null,
      status: 'completed',
      title_en: 'Bike Tracker',
      title_de: 'Bike Tracker',
      description_en:
        "I built this a few years ago because I needed it. Someone stole parts off my bike — the bike computer and the front light were taken right off the handlebars. At the time you could only buy an alarm or a GPS tracker, not both together, so I built my own. You can check it from an app.",
      description_de:
        'Der Bike Tracker ist eine Projektidee, die ich vor etwa drei Jahren aus der Not heraus entwickelt habe. Der Grund dafür war ein Diebstahl an meinem Fahrrad, bei dem der Fahrradcomputer und das Frontlicht vom Lenker entfernt wurden. Da der Markt derzeit nur Alarmanlagen oder GPS-Tracker anbietet, aber nicht die Kombination aus beidem, habe ich das Ganze selbst entwickelt — überwachbar per App.',
      tags_en: ['GPS Tracking', 'Mobile App', 'IoT', 'Arduino'],
      tags_de: ['GPS-Tracking', 'Mobile App', 'IoT', 'Arduino'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/raspi_gps_tracker'
    },
    {
      id: 'magic-mirror',
      image: '/images/projects/magic-mirror.jpg',
      images: null,
      status: 'completed',
      title_en: 'Magic Mirror',
      title_de: 'Magic Mirror',
      description_en: 'A big, flexible project with a lot of possibilities. I use it to see important dates, events and news, and to start my day with a nice quote.',
      description_de: 'Das Magic-Mirror-Projekt ist sehr umfangreich, aber auch flexibel mit endlosen Möglichkeiten. Ich nutze es, um über wichtige Termine, Events und Neuigkeiten informiert zu sein und den Tag mit schönen Sprüchen zu beginnen.',
      tags_en: ['Raspberry Pi', 'JavaScript', 'Smart Display'],
      tags_de: ['Raspberry Pi', 'JavaScript', 'Smart Display'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/magicMirror'
    },
    {
      id: 'pi-hole',
      image: '/images/projects/pihole.png',
      images: null,
      status: 'completed',
      title_en: 'Pi Hole - Ad Blocker',
      title_de: 'Pi-hole - Werbeblocker',
      description_en: 'Pi-hole adds an extra layer of security to my home network — it blocks ads and trackers for every device on the network. It runs on a Raspberry Pi 3.',
      description_de: 'Das Pi-hole-Projekt fügt dem eigenen Heimnetzwerk eine zusätzliche Sicherheitsebene hinzu, um unerwünschte Werbung und Tracking netzwerkweit zu blockieren. Pi-hole läuft auf einem Raspberry Pi III.',
      tags_en: ['Raspberry Pi', 'Networking', 'Privacy'],
      tags_de: ['Raspberry Pi', 'Netzwerk', 'Privatsphäre'],
      link_label_en: 'Visit pi-hole.net',
      link_label_de: 'pi-hole.net besuchen',
      link_url: 'https://pi-hole.net/'
    },
    {
      id: 'homeassistant',
      image: '/images/projects/homeassistant-1.png',
      images: [
        '/images/projects/homeassistant-1.png',
        '/images/projects/homeassistant-2.jpg',
        '/images/projects/homeassistant-3.jpg',
        '/images/projects/homeassistant-4.jpg'
      ],
      status: 'completed',
      title_en: 'HomeAssistant',
      title_de: 'HomeAssistant',
      description_en: 'Home Assistant is an open-source platform that lets you build your own smart home system by connecting and automating different devices. Mine runs on a Raspberry Pi 4.',
      description_de: 'Home Assistant ist eine Open-Source-Plattform, mit der man durch die Integration und Automatisierung verschiedener Geräte und Dienste ein zentralisiertes, individuell anpassbares Smart-Home-System aufbauen kann. HomeAssistant läuft bei mir auf einem Raspberry Pi IV.',
      tags_en: ['Raspberry Pi', 'Home Automation', 'Smart Home'],
      tags_de: ['Raspberry Pi', 'Hausautomatisierung', 'Smart Home'],
      link_label_en: 'Visit home-assistant.io',
      link_label_de: 'home-assistant.io besuchen',
      link_url: 'https://www.home-assistant.io/'
    },
    {
      id: 'own-website',
      image: '/images/projects/website.png',
      images: null,
      status: 'completed',
      title_en: 'Own Website',
      title_de: 'Eigene Webseite',
      description_en: 'This website. Built with Next.js and Bootstrap, and hosted on AWS.',
      description_de: 'Die Erstellung dieser Webseite. Sie basiert auf Next.js in Kombination mit Bootstrap als Frontend-CSS-Framework und wird über einen AWS-Bucket gehostet.',
      tags_en: ['Next.js', 'React', 'AWS'],
      tags_de: ['Next.js', 'React', 'AWS'],
      link_label_en: 'View on GitHub',
      link_label_de: 'Auf GitHub ansehen',
      link_url: 'https://github.com/dev-dany97/homepage'
    },
    {
      id: 'crypto-trading-bot',
      image: '/images/projects/cryptotrading-bot.png',
      images: null,
      status: 'in-progress',
      title_en: 'Crypto Trading Bot',
      title_de: 'Crypto Trading Bot',
      description_en: 'This bot watches the price of a few cryptocurrencies and buys or sells automatically when the price is low or high.',
      description_de: 'Der Crypto Trading Bot überwacht aktuelle Preisänderungen ausgewählter Kryptowährungen und kauft oder verkauft, wenn der Preis niedrig oder hoch ist — so werden Handelsentscheidungen automatisiert.',
      tags_en: ['Python', 'Trading API', 'Automation'],
      tags_de: ['Python', 'Trading-API', 'Automatisierung'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    },
    {
      id: 'radar-recognition',
      image: '/images/projects/radar.png',
      images: null,
      status: 'in-progress',
      title_en: 'Radar Recognition',
      title_de: 'Radar-Erkennung',
      description_en: 'This project looks at object recognition and what you could automate with it — like opening a garage door automatically when it detects something.',
      description_de: 'Das Projekt untersucht Objekterkennung und mögliche automatisierte Aktionen, wie zum Beispiel das automatische Öffnen eines Garagentors basierend auf erkannten Objekten.',
      tags_en: ['Computer Vision', 'Object Detection', 'Hardware'],
      tags_de: ['Computer Vision', 'Objekterkennung', 'Hardware'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    },
    {
      id: 'water-quality',
      image: '/images/projects/waterqualitysystem.png',
      images: null,
      status: 'in-progress',
      title_en: 'Water Quality Testing System',
      title_de: 'Wasserqualitäts-Testsystem',
      description_en: "If you have an aquarium or a pond with fish or other animals in it, you're responsible for them. A lot of people don't really know how good or bad their water quality is. This system measures the important values all the time and shows them to you.",
      description_de: 'Wer ein Aquarium oder einen Teich besitzt und darin Lebewesen hält, trägt auch eine gewisse Verantwortung. Viele wissen nicht, wie gut oder schlecht die Wasserqualität ist, in der Fische, Schnecken oder andere Tiere leben. Dieses System misst kontinuierlich zentrale Parameter und meldet sie.',
      tags_en: ['IoT', 'Sensors', 'Raspberry Pi'],
      tags_de: ['IoT', 'Sensoren', 'Raspberry Pi'],
      link_label_en: null,
      link_label_de: null,
      link_url: null
    }
  ];

  const insert = db.prepare(`
    INSERT INTO projects (id, sort_order, image, images, status, title_en, title_de, description_en, description_de, tags_en, tags_de, link_label_en, link_label_de, link_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  projects.forEach((p, i) => {
    insert.run(
      p.id,
      i,
      p.image,
      p.images ? JSON.stringify(p.images) : null,
      p.status,
      p.title_en,
      p.title_de,
      p.description_en,
      p.description_de,
      JSON.stringify(p.tags_en),
      JSON.stringify(p.tags_de),
      p.link_label_en,
      p.link_label_de,
      p.link_url
    );
  });
}

function buildGallery(folder: string, count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, i) => `/images/travel/${folder}/${prefix}${i + 1}.jpg`);
}

function seedTravel(db: DatabaseSync) {
  const sailingFiles = [
    'sailing1.jpg', 'sailing2.jpg', 'sailing3.jpg', 'sailing4.jpg', 'sailing5.jpg', 'sailing6.jpg',
    'sailing7.JPG', 'sailing8.jpg', 'sailing9.jpg', 'sailing10.jpg', 'sailing11.jpg', 'sailing12.jpg',
    'sailing13.jpg', 'sailing14.JPG', 'sailing15.JPG', 'sailing16.JPG', 'sailing17.JPG', 'sailing18.JPG',
    'sailing19.jpg', 'sailing20.JPG', 'sailing21.JPG', 'sailing22.JPG', 'sailing23.jpg', 'sailing24.JPG',
    'sailing25.JPG', 'sailing26.jpg', 'sailing27.jpg', 'sailing28.jpg', 'sailing29.jpg', 'sailing30.jpg',
    'sailing31.jpg', 'sailing32.jpg', 'sailing33.jpg'
  ].map((f) => `/images/travel/sailing/${f}`);

  const destinations = [
    {
      id: 'sailing', flag: 'IT', image: '/images/travel/sailing/sailing1.jpg', imageCount: 33, gallery: sailingFiles,
      name_en: 'Sardinia', name_de: 'Sardinien',
      description_en: 'Exploring the coast and some great moments out sailing.',
      description_de: 'Erkundung der Küstengewässer und unvergessliche Momente beim Segeln.'
    },
    {
      id: 'dubai', flag: 'AE', image: '/images/travel/dubai/dubai1.jpg', imageCount: 8, gallery: buildGallery('dubai', 8, 'dubai'),
      name_en: 'Dubai', name_de: 'Dubai',
      description_en: 'Modern buildings, desert views and a lively city.',
      description_de: 'Moderne Architektur, Wüstenblicke und pulsierendes Stadtleben.'
    },
    {
      id: 'bangkok', flag: 'TH', image: '/images/travel/bangkok/bangkok1.jpg', imageCount: 16, gallery: buildGallery('bangkok', 16, 'bangkok'),
      name_en: 'Bangkok', name_de: 'Bangkok',
      description_en: "Floating markets, longtail boats and the busy energy of Thailand's capital.",
      description_de: 'Schwimmende Märkte, Longtail-Boote und das lebendige Chaos von Thailands Hauptstadt.'
    },
    {
      id: 'paris', flag: 'FR', image: '/images/travel/paris/paris1.jpg', imageCount: 10, gallery: buildGallery('paris', 10, 'paris'),
      name_en: 'Paris', name_de: 'Paris',
      description_en: 'A city trip to Paris, including a front-row night at the VALORANT Champions Tour.',
      description_de: 'Städtetrip nach Paris, inklusive einer Nacht in der ersten Reihe bei der VALORANT Champions Tour.'
    },
    {
      id: 'canary-islands', flag: 'ES', image: '/images/travel/canary-islands/canary1.jpg', imageCount: 20, gallery: buildGallery('canary-islands', 20, 'canary'),
      name_en: 'Canary Islands', name_de: 'Kanarische Inseln',
      description_en: 'Volcanic landscapes, desert trails and rough coastline with friends.',
      description_de: 'Vulkanlandschaften, Wüstenpfade und raue Küste mit Freunden.'
    },
    {
      id: 'italy-trip', flag: 'IT', image: '/images/travel/italy-trip/italytrip1.jpg', imageCount: 13, gallery: buildGallery('italy-trip', 13, 'italytrip'),
      name_en: 'Italy', name_de: 'Italien',
      description_en: 'A road trip through Italy — old towns, the coast and good food.',
      description_de: 'Ein Roadtrip durch Italien — historische Städte, Küste und gutes Essen.'
    },
    {
      id: 'croatia', flag: 'HR', image: '/images/travel/croatia/croatia1.jpg', imageCount: 9, gallery: buildGallery('croatia', 9, 'croatia'),
      name_en: 'Croatia', name_de: 'Kroatien',
      description_en: 'Sailing along the Adriatic coast, with drone shots of the islands.',
      description_de: 'Segeln an der Adriaküste mit Luftaufnahmen der Inseln aus der Drohne.'
    },
    {
      id: 'australia', flag: 'AU', image: '/images/travel/australia/australia1.jpg', imageCount: 35, gallery: buildGallery('australia', 35, 'australia'),
      name_en: 'Australia', name_de: 'Australien',
      description_en: 'Amazing landscapes, beaches and a road trip down under.',
      description_de: 'Epische Landschaften, Strände und Roadtrip-Abenteuer down under.'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO travel_destinations (id, sort_order, flag, image, image_count, gallery, name_en, name_de, description_en, description_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  destinations.forEach((d, i) => {
    insert.run(d.id, i, d.flag, d.image, d.imageCount, JSON.stringify(d.gallery), d.name_en, d.name_de, d.description_en, d.description_de);
  });
}

function seedSetup(db: DatabaseSync) {
  // Hardware specs (brand/product names) stay identical in both languages.
  const primary: Array<{ label: string; value: string; image?: string }> = [
    { label: 'CPU', value: 'AMD Ryzen 7 2700X', image: '/images/setup/pc-setup/cpu-image.jpg' },
    { label: 'GPU', value: 'ASUS ROG STRIX NVIDIA GeForce RTX 2080 Advanced', image: '/images/setup/pc-setup/graphic-image.jpg' },
    { label: 'RAM', value: '32 GB - 4x G.Skill DIMM 8GB DDR4-3200, Trident Z RGB', image: '/images/setup/pc-setup/ram-image.jpg' },
    { label: 'Memory SSD', value: 'Samsung 850 Pro 2.5 256GB + Samsung SSD 850 Evo 250GB + Samsung SSD 870 EVO 1TB + WD BLACK SSD AN1500 4TB', image: '/images/setup/pc-setup/memory-image.jpg' },
    { label: 'Memory M2', value: 'SanDisk Extreme PRO M.2 500GB + WD Black SN750 500GB', image: '/images/setup/pc-setup/memory-m2.jpg' },
    { label: 'MB', value: 'ASUS ROG Strix X470-F Gaming', image: '/images/setup/pc-setup/mb-image.jpg' },
    { label: 'Water Cooling', value: 'Alphacool Eisbecher Helix 250 + Alphacool Eisblock XPX Aurora Plexi Digital RGB + Alphacool Eisfluegel Aurora Durchflussanzeiger', image: '/images/setup/pc-setup/water-cooling-image.jpg' },
    { label: 'Fan', value: 'LIAN LI UNI FAN SL-INF 120', image: '/images/setup/pc-setup/fan-image.jpg' },
    { label: 'Case', value: 'LIAN LI O11 Dynamic', image: '/images/setup/pc-setup/case-image.jpg' },
    { label: 'PowerSupply', value: 'be quiet! Dark Power Pro 11 1000W', image: '/images/setup/pc-setup/power-supply-image.jpg' },
    { label: 'Keyboard', value: 'Logitech G910 Orion Spectrum', image: '/images/setup/pc-setup/keyboard-image.jpg' },
    { label: 'Mouse', value: 'Logitech G900 Chaos Spectrum + Logitech G Powerplay', image: '/images/setup/pc-setup/mouse-image.jpg' },
    { label: 'Wheel', value: 'Logitech G29' },
    { label: 'Microphone', value: 'HyperX QuadCast S', image: '/images/setup/pc-setup/microphone-image.jpg' },
    { label: 'Monitor', value: 'Samsung C49HG90DMU 49"', image: '/images/setup/pc-setup/monitor-image.jpg' },
    { label: 'Cable', value: 'Motherboard 24-Pin, GPU Dual 8-Pin Cable: Streamer Plus V2', image: '/images/setup/pc-setup/cable-image.jpg' },
    { label: 'Custom Water Front Plate', value: 'LIAN LI O11D XL FRONT PLATE SK2 + D5/DDC ADAPTER' }
  ];

  const secondEn: Array<{ label: string; value: string }> = [
    { label: 'CPU', value: 'Example: AMD Ryzen 5 (exact model TBD)' },
    { label: 'GPU', value: 'Example: NVIDIA GeForce RTX 3060 (exact model TBD)' },
    { label: 'RAM', value: 'Example: 16-32 GB DDR4 (exact kit TBD)' },
    { label: 'Storage', value: 'Example: 1 TB NVMe SSD (exact model TBD)' },
    { label: 'MB', value: 'Example: mATX motherboard (exact model TBD)' },
    { label: 'Case', value: 'NZXT H-Series (white)' },
    { label: 'Cooling', value: 'Air cooling (exact cooler TBD)' },
    { label: 'PowerSupply', value: 'Example: 650-750W (exact model TBD)' }
  ];

  const secondDe: Array<{ label: string; value: string }> = [
    { label: 'CPU', value: 'Beispiel: AMD Ryzen 5 (genaues Modell noch offen)' },
    { label: 'GPU', value: 'Beispiel: NVIDIA GeForce RTX 3060 (genaues Modell noch offen)' },
    { label: 'RAM', value: 'Beispiel: 16-32 GB DDR4 (genaues Kit noch offen)' },
    { label: 'Storage', value: 'Beispiel: 1 TB NVMe SSD (genaues Modell noch offen)' },
    { label: 'MB', value: 'Beispiel: mATX-Mainboard (genaues Modell noch offen)' },
    { label: 'Case', value: 'NZXT H-Series (weiß)' },
    { label: 'Cooling', value: 'Luftkühlung (genauer Kühler noch offen)' },
    { label: 'PowerSupply', value: 'Beispiel: 650-750W (genaues Modell noch offen)' }
  ];

  const insert = db.prepare(`
    INSERT INTO setup_components (build, sort_order, label, value_en, value_de, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  primary.forEach((c, i) => insert.run('primary', i, c.label, c.value, c.value, c.image ?? null));
  secondEn.forEach((c, i) => insert.run('second', i, c.label, c.value, secondDe[i].value, null));
}

function seedFinance(db: DatabaseSync) {
  const platforms = [
    {
      id: 'binance', name: 'Binance', url: 'https://www.binance.com',
      description_en: 'The exchange I use for active crypto day-trading — fast entries and exits.',
      description_de: 'Meine Börse für aktives Krypto-Day-Trading — schnelle Ein- und Ausstiege.',
      affiliate_url: 'https://www.binance.com'
    },
    {
      id: 'trade-republic', name: 'Trade Republic', url: 'https://traderepublic.com',
      description_en: 'My broker for taking targeted positions in individual stocks.',
      description_de: 'Mein Broker für gezielte Positionen in Einzelaktien.',
      affiliate_url: 'https://refnocode.trade.re/jgh5ljqh'
    },
    {
      id: 'market-mavens', name: 'Market Mavens e.V.', url: 'https://marketmavens-ev.com/',
      description_en: "I'm a member of the student finance club at Hochschule Deggendorf, where we talk about markets and investing.",
      description_de: 'Mitglied der studentischen Finanzvereinigung an der Hochschule Deggendorf, Austausch über Märkte und Investieren.',
      affiliate_url: null
    }
  ];

  const insertPlatform = db.prepare(`
    INSERT INTO finance_platforms (id, sort_order, name, url, description_en, description_de, affiliate_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  platforms.forEach((p, i) => insertPlatform.run(p.id, i, p.name, p.url, p.description_en, p.description_de, p.affiliate_url));

  const resources = [
    { id: 'boerse-de', name: 'Börse.de', url: 'https://www.boerse.de', category: 'Marktdaten' },
    { id: 'coinmarketcap', name: 'CoinMarketCap', url: 'https://coinmarketcap.com', category: 'Marktdaten' },
    { id: 'bloomberg', name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'Nachrichten' },
    { id: 'oaws', name: 'Ohne Aktien wird schwer', url: 'https://open.spotify.com/show/2asbnnLJbo3dzukAJQfie6', category: 'Podcasts' },
    { id: 'wallstreet-koch', name: 'Wall Street mit Markus Koch', url: 'https://open.spotify.com/show/3rTbUHHq3tpY5XYqQkem8c', category: 'Podcasts' },
    { id: 'marktgefluester', name: 'Marktgeflüster', url: 'https://open.spotify.com/show/3y9LP87SHF5b3hciAsZDBh', category: 'Podcasts' }
  ];

  const insertResource = db.prepare('INSERT INTO finance_resources (id, sort_order, name, url, category) VALUES (?, ?, ?, ?, ?)');
  resources.forEach((r, i) => insertResource.run(r.id, i, r.name, r.url, r.category));

  // Manually entered positions (Trade Republic has no public API) — quantity + buy
  // price only, used purely to compute allocation % and gain % since purchase.
  // Absolute € amounts are never exposed via the API, same privacy rule as crypto.
  // Example positions, not my real holdings.
  const stocks = [
    { ticker: 'AAPL', name: 'Apple', quantity: 1, buy_price: 100 },
    { ticker: 'AMZN', name: 'Amazon', quantity: 1, buy_price: 100 },
    { ticker: 'IS3R.DE', name: 'iShares Edge MSCI World Momentum', quantity: 1, buy_price: 100 },
    { ticker: 'MUV2.DE', name: 'Münchener Rück', quantity: 1, buy_price: 100 },
    { ticker: 'GOOGL', name: 'Alphabet', quantity: 1, buy_price: 100 }
  ];
  const insertStock = db.prepare(
    'INSERT INTO stock_positions (ticker, name, quantity, buy_price, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  stocks.forEach((s, i) => insertStock.run(s.ticker, s.name, s.quantity, s.buy_price, i));
}

function seedResume(db: DatabaseSync) {
  const experience = [
    {
      role_en: 'Developer Automotive', role_de: 'Developer Automotive', company: 'intive GmbH',
      period_en: '04/2023 – present', period_de: '04/2023 – heute',
      description_en: "I'm working on a tool that analyzes, visualizes and processes bus system data, with AI-assisted data analysis and plausibility checks.",
      description_de: 'Weiterentwicklung eines Tools zur Analyse, Visualisierung und Verarbeitung von Bussystemdaten, inkl. KI-gestützter Datenanalyse und Plausibilitätsprüfung.'
    },
    {
      role_en: 'Junior Software Developer', role_de: 'Junior Software Developer', company: 'intive GmbH',
      period_en: '01/2022 – 03/2023', period_de: '01/2022 – 03/2023',
      description_en: 'I developed software components to process radar sensor data for automotive, on ARM Cortex-R4 and FreeRTOS.',
      description_de: 'Entwicklung von Softwarekomponenten zur Verarbeitung von Radarsensordaten im Automotive-Umfeld auf ARM Cortex-R4 und FreeRTOS.'
    },
    {
      role_en: 'Working Student / Master’s Thesis', role_de: 'Werkstudent / Masterand', company: 'intive automotive GmbH',
      period_en: '08/2019 – 10/2021', period_de: '08/2019 – 10/2021',
      description_en: 'I built an embedded software component for obstacle detection, using a radar hardware accelerator (TI AWR1843BOOST).',
      description_de: 'Entwicklung einer embedded Softwarekomponente zur Hinderniserkennung mittels Radar Hardware Accelerator (TI AWR1843BOOST).'
    },
    {
      role_en: 'Working Student & Intern', role_de: 'Werkstudent & Praktikant', company: 'iNTENCE automotive electronics GmbH',
      period_en: '08/2017 – 07/2019', period_de: '08/2017 – 07/2019',
      description_en: 'Python-based build automation and tooling, plus a C#/.NET project to control a power supply for driver assistance systems.',
      description_de: 'Python-basierte Build-Automatisierung und Tooling sowie ein C#/.NET-Projekt zur Netzteilansteuerung im Fahrerassistenzumfeld.'
    }
  ];

  const insertExperience = db.prepare(`
    INSERT INTO resume_experience (sort_order, role_en, role_de, company, period_en, period_de, description_en, description_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  experience.forEach((e, i) =>
    insertExperience.run(i, e.role_en, e.role_de, e.company, e.period_en, e.period_de, e.description_en, e.description_de)
  );

  const education = [
    {
      degree_en: 'M.Sc. Applied Computer Science / Infotronics', degree_de: 'M.Sc. Angewandte Informatik / Infotronik',
      institution_en: 'TH Deggendorf', institution_de: 'TH Deggendorf',
      period_en: '2019 – present', period_de: '2019 – heute',
      note_en: 'Grade: 1.5', note_de: 'Note: 1,5',
      thesis_en: 'Thesis: Development of an Embedded Software Component for Obstacle Detection Using a Radar Hardware Accelerator',
      thesis_de: 'Masterarbeit: Entwicklung einer embedded Softwarekomponente zur Hinderniserkennung mittels Radar Hardware Accelerator'
    },
    {
      degree_en: 'Exchange Semester', degree_de: 'Auslandssemester',
      institution_en: 'Griffith University, Brisbane, Australia', institution_de: 'Griffith University, Brisbane, Australien',
      period_en: '2020 – 2021', period_de: '2020 – 2021',
      note_en: 'GPA: 6.67 / 7.00', note_de: 'GPA: 6,67 / 7,00',
      thesis_en: '', thesis_de: ''
    },
    {
      degree_en: 'B.Sc. Computer Engineering', degree_de: 'B.Sc. Technische Informatik',
      institution_en: 'OTH Regensburg', institution_de: 'OTH Regensburg',
      period_en: '2015 – 2019', period_de: '2015 – 2019',
      note_en: '', note_de: '',
      thesis_en: 'Thesis: Analysis and Implementation of Build Time Optimization Through Massive Parallelization of a Multi-Computer System',
      thesis_de: 'Bachelorarbeit: Analyse und Umsetzung von Möglichkeiten zur Buildzeitoptimierung durch die massive Parallelisierung eines Mehrrechnersystems'
    }
  ];

  const insertEducation = db.prepare(`
    INSERT INTO resume_education (sort_order, degree_en, degree_de, institution_en, institution_de, period_en, period_de, note_en, note_de, thesis_en, thesis_de)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  education.forEach((e, i) =>
    insertEducation.run(i, e.degree_en, e.degree_de, e.institution_en, e.institution_de, e.period_en, e.period_de, e.note_en, e.note_de, e.thesis_en, e.thesis_de)
  );

  const skills = ['C/C++', 'Python', 'C#', 'JavaScript', 'VHDL', 'SQL', 'Docker', 'Git', 'CI/CD', 'UML', 'Scrum'];
  const insertSkill = db.prepare('INSERT INTO resume_skills (sort_order, name) VALUES (?, ?)');
  skills.forEach((s, i) => insertSkill.run(i, s));

  const certificates = [
    { en: 'ISTQB Certified Tester (iSQI Group)', de: 'ISTQB Certified Tester (iSQI Group)' },
    { en: 'AWS Cloud Practitioner Essentials', de: 'AWS Cloud Practitioner Essentials' },
    { en: 'Embedded Software Design & Patterns with C (MicroConsult)', de: 'Embedded-Software-Design und Patterns mit C (MicroConsult)' },
    { en: 'Autosar Architecture', de: 'Autosar Architecture' },
    { en: 'Embedded Systems Programming on ARM Cortex M3/M4', de: 'Embedded Systems Programming on ARM Cortex M3/M4' },
    { en: 'DAAD English Language Certificate', de: 'DAAD-Sprachzertifikat Englisch' }
  ];
  const insertCert = db.prepare('INSERT INTO resume_certificates (sort_order, name_en, name_de) VALUES (?, ?, ?)');
  certificates.forEach((c, i) => insertCert.run(i, c.en, c.de));
}
